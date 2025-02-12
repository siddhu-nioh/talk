const Post = require('../models/posts');
const User = require('../models/user');
const shuffleArray = (array) => {
      return array.sort(() => Math.random() - 0.5);
};
let isFirstFetch = true;
module.exports.renderIndex = async (req, res) => {
      let datas = await Post.find({}).sort({ createdAt: -1 }).populate("owner");
      if (isFirstFetch) {
            const LATEST_COUNT = 5; 
            const newestPosts = datas.slice(0, LATEST_COUNT);
            let olderPosts = datas.slice(LATEST_COUNT);
            olderPosts = shuffleArray(olderPosts);
            const finalPosts = [...newestPosts, ...olderPosts];
            isFirstFetch = false;
            return res.json(finalPosts);
      } else {
            const finalPosts = shuffleArray(datas);
            return res.json(finalPosts);
      }
};
module.exports.renderNew = (req, res) => {
      res.render("main/new");
}
module.exports.renderSearch = (req, res) => {
      res.render("main/search");
}
module.exports.renderUser = (req, res) => {
      res.render("main/user");
}
module.exports.postUpload = async (req, res) => {
      const { description } = req.body;
      const { image, video } = req.media;
      const newData = new Post({
            image: image || null,
            video: video || null,
            description,
            owner: req.user._id,
      });
      await newData.save();
      console.log(newData)
      const user = await User.findById(req.user._id);
      user.posts.push(newData);
      await user.save();
      req.flash('success', 'Successfully uploaded the post');
      res.redirect('/talk');
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
}

