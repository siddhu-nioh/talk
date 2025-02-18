const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require( "../models/User");
module.exports.renderSignup = (req, res) => {
    res.render("user/signup");
};

module.exports.renderLogin = (req, res) => {
    res.render("user/login");
};

module.exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const profilePicture = req.files?.profile ? req.files.profile[0].path : undefined;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        // Create new user
        const newUser = new User({ username, email, profile: profilePicture, password });
        await newUser.save();

        // Generate JWT
        const token = newUser.generateAuthToken();

        // Send response
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profile: newUser.profile,
            },
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = user.generateAuthToken();

        // Send response
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.logout = (req, res) => {
    // Logout is handled on the frontend by removing the token
    res.status(200).json({ message: "Logged out successfully" });
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
        res.json({ message: `Successfully followed ${user.username}` });
    } else {
        res.json({ message: `You are already following ${user.username}` });
    }
};

module.exports.unFollowUser = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
    res.json({ message: "Successfully unfollowed the user" });
};

module.exports.allFollowers = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("followers");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ followers: user.followers });
};
