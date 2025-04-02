const mongoose = require("mongoose");
const shortId = require("shortid");
const shortUrlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  shorturl: {
    type: String,
    required: true,
    default: () => shortId.generate(),
  },
});

module.exports = mongoose.model("ShortUrl", shortUrlSchema);
