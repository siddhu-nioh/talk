// const Post = require('../models/posts');
// const User = require('../models/user');
// const shuffleArray = (array) => {
//       return array.sort(() => Math.random() - 0.5);
// };
// let isFirstFetch = true;
// module.exports.renderIndex = async (req, res) => {
//       let datas = await Post.find({}).sort({ createdAt: -1 }).populate("owner");
//       if (isFirstFetch) {
//             const LATEST_COUNT = 5; 
//             const newestPosts = datas.slice(0, LATEST_COUNT);
//             let olderPosts = datas.slice(LATEST_COUNT);
//             olderPosts = shuffleArray(olderPosts);
//             const finalPosts = [...newestPosts, ...olderPosts];
//             isFirstFetch = false;
//             return res.json(finalPosts);
//       } else {
//             const finalPosts = shuffleArray(datas);
//             return res.json(finalPosts);
//       }
// };

// module.exports.renderNew = (req, res) => {
//       res.render("main/new");
// }
// module.exports.renderSearch = (req, res) => {
//       res.render("main/search");
// }
// module.exports.renderUser = (req, res) => {
//       res.render("main/user");
// }
// module.exports.postUpload = async (req, res) => {
//       const { description } = req.body;
//       const { image, video } = req.media;
//       const newData = new Post({
//             image: image || null,
//             video: video || null,
//             description,
//             owner: req.user._id,
//       });
//       await newData.save();
//       console.log(newData)
//       const user = await User.findById(req.user._id);
//       user.posts.push(newData);
//       await user.save();
//        res.status(201).json({ message: 'Successfully uploaded the post', data: newData });
//       res.redirect('/talk');
// };
// module.exports.searchUsers = async (req, res) => {
//       const query = req.query.query;
//       const users = await User.find({
//             $or: [
//                   { username: { $regex: query, $options: "i" } },
//                   { name: { $regex: query, $options: "i" } },
//             ]
//       }).limit(10);
//       res.status(200).json(users);
// }

const Post = require('../models/posts');
const User = require('../models/user');

// Shuffle array helper function
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

// Updated index route with pagination
module.exports.renderIndex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Number of posts per page
    const skip = (page - 1) * limit;
    
    // Get total count of posts for pagination info
    const totalPosts = await Post.countDocuments({});
    
    // Fetch posts with pagination
    let posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner");
    
    // Only shuffle if it's not the first page
    if (page > 1) {
      posts = shuffleArray(posts);
    }
    
    return res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      hasMore: page < Math.ceil(totalPosts / limit)
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// route for account page only 
module.exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 }) // newest first
      .populate("owner");

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
};

module.exports.renderNew = (req, res) => {
  res.render("main/new");
};

module.exports.renderSearch = (req, res) => {
  res.render("main/search");
};

module.exports.renderUser = (req, res) => {
  res.render("main/user");
};

// module.exports.postUpload = async (req, res) => {
//   try {
//     const { description } = req.body;
//     const image = req.media?.image || null;
// const video = req.media?.video || null;

    
//     const newData = new Post({
//       image: image || null,
//       video: video || null,
//       description,
//       owner: req.user._id,
//       likes: [],
//       comments: []
//     });
    
//     await newData.save();
    
//     const user = await User.findById(req.user._id);
//     user.posts.push(newData);
//     await user.save();
//     console.log(" User:", req.user);
// console.log(" Description:", req.body.description);
// console.log(" Media received:", req.files);
// console.log(" Parsed media:", req.media);


//     res.status(201).json({ 
//       message: 'Successfully uploaded the post', 
//       data: newData 
//     });
//   } catch (error) {
//     console.error("Error uploading post:", error);
//     res.status(500).json({ error: "Failed to upload post" });
//     console.log(" User:", req.user);
// console.log(" Description:", req.body.description);
// console.log(" Media received:", req.files);
// console.log("Parsed media:", req.media);

//   }
// // };
// module.exports.postUpload = async (req, res) => {
//   if (!req.user || !req.user._id) {
//     console.error("❌ Missing req.user or req.user._id");
//     return res.status(401).json({ message: "User info not found in request" });
// }

//   try {
//     console.log("➡️ postUpload triggered");
//     console.log("📎 req.body.description:", req.body.description);
//     console.log("🖼️ req.files:", req.files);
//     console.log("📦 req.media:", req.media);
//     console.log("🔐 req.user:", req.user);

//     const { description } = req.body;
//     const { image, video } = req.media;

//     const newData = new Post({
//       image: image || null,
//       video: video || null,
//       description,
//       owner: req.user._id,
//       likes: [],
//       comments: []
//     });

//     console.log("📤 Saving post to DB...");
//     await newData.save();

//     const user = await User.findById(req.user._id);
//     user.posts.push(newData);
//     await user.save();

//     console.log("✅ Post created successfully");
//     res.status(201).json({ message: 'Successfully uploaded the post', data: newData });

//   } catch (error) {
//     console.error("❌ Error uploading post:", error);
//     res.status(500).json({ error: "Failed to upload post" });
//   }
// };


module.exports.postUpload = async (req, res) => {
  if (!req.user || !req.user._id) {
    console.error(" Missing req.user or req.user._id");
    return res.status(401).json({ message: "User info not found in request" });
  }
  
  try {
    console.log(" postUpload triggered");
    console.log(" req.body.description:", req.body.description);
    console.log(" req.files:", req.files);
    console.log(" req.user:", req.user);
    
    const { description } = req.body;
    
    // Create media object from files
    const media = {
      image: req.files.image ? req.files.image[0].path : null,
      video: req.files.video ? req.files.video[0].path : null
    };
    
    // Allow posts without media (text-only posts)
    const newData = new Post({
      image: media.image,
      video: media.video,
      description: description || "",  // Allow empty descriptions
      owner: req.user._id,
      likes: [],
      comments: []
    });
    
    console.log("Saving post to DB...");
    await newData.save();
    
    const user = await User.findById(req.user._id);
    user.posts.push(newData);
    await user.save();
    
    console.log(" Post created successfully");
    res.status(201).json({
      message: 'Successfully uploaded the post',
      data: newData
    });
  } catch (error) {
    console.error(" Error uploading post:", error);
    res.status(500).json({ error: "Failed to upload post", details: error.message });
  }
};

module.exports.searchUsers = async (req, res) => {
  const query = req.query.query;
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: "i" } },
      { name: { $regex: query, $options: "i" } },
    ]
  }).limit(10);
  res.status(200).json(users);
};  

// New route to like a post
module.exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Check if user already liked the post
    const alreadyLiked = post.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }
    
    await post.save();
    
    res.status(200).json({ 
      likes: post.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
};

// New route to add a comment
module.exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: "Comment text is required" });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    const user = await User.findById(userId);
    
    const newComment = {
      text,
      author: userId,
      authorUsername: user.username,
      authorProfile: user.profile,
      createdAt: new Date()
    };
    
    post.comments.push(newComment);
    await post.save();
    
    res.status(201).json({ 
      message: "Comment added successfully",
      comment: newComment
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};