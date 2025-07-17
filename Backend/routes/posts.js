
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/create', async (req, res) => {
  const { username, caption, imageUrl, timestamp } = req.body;
  if (!username || !caption || !imageUrl) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const newPost = new Post({ username, caption, imageUrl, timestamp });
    await newPost.save();
    res.json({ success: true, message: 'Post created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

module.exports = router;
