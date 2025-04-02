const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortmodel");
const dns = require("dns");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

dotenv.config();
async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint

app.get("/api/hello", function (req, res, next) {
  res.status(200).json({ message: "hello world" });
});

app.post("/api/shorturl", async function (req, res) {
  const { url_input } = req.body;
  const hostname = url_input.replace("https://", "");

  dns.lookup(hostname, function (error) {
    if (error) {
      return res.json({ error: 'invalid url' });
    }
  });
  try {
    const shortid = await ShortUrl.findOne({ url: url_input });
    if (!shortid) {
      const xc = await ShortUrl.create({ url: url_input });
      return res
        .status(200)
        .json({ original_url: url_input, short_url: xc.shorturl });
    }
    return res
      .status(200)
      .json({ original_url: url_input, short_url: shortid.shorturl });
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/shorturl", async function (req, res) {
  res.json({ error: "No input" });
});

app.get("/api/shorturl/:shortcutid", async function (req, res) {
  const { shortcutid } = req.params;

  if (!shortcutid) return res.json({ error: "No input" });

  const result = await ShortUrl.findOne({ shorturl: shortcutid });

  if (result) return res.redirect(result.url);

  return res.json({ error: "No short URL found for the given input" });
});

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB Disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("mongoDB connected!");
});

app.listen(port, function () {
  connect();
  console.log(`Listening on port ${port}`);
});
