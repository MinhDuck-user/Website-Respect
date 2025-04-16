const Post = require('../models/Post');

const createPost = async (req, res) => {
  const { title, content, author } = req.body;
  const post = new Post({ title, content, author });
  await post.save();
  res.json({ message: 'Post created successfully' });
};

const getPosts = async (req, res) => {
  const posts = await Post.find().populate('author', 'username');
  res.json(posts);
};

module.exports = { createPost, getPosts };

