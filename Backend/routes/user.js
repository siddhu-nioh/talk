const express = require("express");
const router = express.Router();
const userRouter = require("../controllers/user");
const { ensureAuthenticated } = require("../middleware");
const upload = require("../cloudConfig");
const wrapAsync = require('../utils/wrapAsync');

// Signup
router.post("/signup", upload, userRouter.signup);

// Login
router.post("/login", userRouter.login);
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.get("/auth/check", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ authenticated: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        const user = await User.findById(decoded._id).select("-password"); // Find user

        if (!user) {
            return res.status(401).json({ authenticated: false, message: "User not found" });
        }

        res.status(200).json({
            authenticated: true,
            user,
        });
    } catch (err) {
        console.error("Auth check error:", err);
        res.status(401).json({ authenticated: false, message: "Invalid token" });
    }
});
// Logout
router.get("/logout", userRouter.logout);

router.get("/user/me", ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("posts"); // populate if needed
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("Error in /user/me:", err);
        res.status(500).json({ error: "Server error" });
    }
});
// User Profile

router.get("/user/:id", ensureAuthenticated, userRouter.showUsers);





// Follow/Unfollow
router.post("/user/follow/:id", ensureAuthenticated, userRouter.followUser);
router.post("/user/unfollow/:id", ensureAuthenticated, userRouter.unFollowUser);

// Followers
router.get("/user/followers/:id", ensureAuthenticated, userRouter.allFollowers);
//update user profile picture

router.post("/user/profile/picture", ensureAuthenticated, upload, wrapAsync(userRouter.updateProfile));

// Search users by name or email
router.get("/search", ensureAuthenticated, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const users = await User.find({
            $or: [
                { name: new RegExp(query, "i") },
                { email: new RegExp(query, "i") }
            ]
        }).select("-password");

        res.status(200).json(users);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
