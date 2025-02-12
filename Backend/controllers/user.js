const User = require("../models/user");
const passport = require("passport");

module.exports.renderLogin = (req, res) => {
    res.render("user/login");
};

module.exports.renderSignup = (req, res) => {
    res.render("user/signup");
};

module.exports.signup = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const profilePicture = req.files?.profile ? req.files.profile[0].path : undefined;
        
        const newUser = new User({ username, email, profile: profilePicture || undefined });
        const user = await User.register(newUser, password);

        
        req.login(user, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/talk");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to WanderLust");
    res.json({ user: req.user, message: "Logged in successfully" });
};


module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            res.clearCookie("connect.sid"); 
            req.flash("success", "You have successfully logged out");
            res.redirect("/talk");
        });
    });
};


module.exports.showUsers = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("posts");
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.followers.some(follower => follower.toString() === req.user?._id.toString());
    res.json({ ...user.toObject(), isFollowing });
};


module.exports.followUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user.followers.includes(req.user._id)) {
        user.followers.push(req.user._id);
        req.user.following.push(id);
        await req.user.save();
        await user.save();
        req.flash("success", "Successfully followed " + user.username);
    } else {
        req.flash("info", "You are already following " + user.username);
    }
    res.redirect(`/user/${id}`);
};


module.exports.unFollowUser = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
    
    req.flash("success", "Successfully unfollowed the user");
    res.json({ userId: id });
};


module.exports.allFollowers = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("followers");
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ followers: user.followers });
};
