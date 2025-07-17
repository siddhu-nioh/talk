
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  username: { type: String, required: true },
  caption: { type: String, required: true },
  imageUrl: { type: String, required: true },
  timestamp: { type: Number, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
