const express = require("express");
const router = express.Router();
const userRouter = require("../controllers/user");
const { ensureAuthenticated } = require("../middleware");
const upload = require("../cloudConfig");

// Signup
router.get("/signup", userRouter.renderSignup);
router.post("/signup", upload, userRouter.signup);

// Login
router.get("/login", userRouter.renderLogin);
router.post("/login", userRouter.login);
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.get("/auth/check", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get the token from the Authorization header  so this is the first thing we do in this as we per session data previous samely

    if (!token) {
        return res.status(401).json({ authenticated: false, message: "No token provided" });
    }

    try {
      
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
        const user = await User.findById(decoded._id).select("-password");
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

// User Profile
router.get("/user/:id", ensureAuthenticated, userRouter.showUsers);

// Follow/Unfollow
router.post("/user/follow/:id", ensureAuthenticated, userRouter.followUser);
router.post("/user/unfollow/:id", ensureAuthenticated, userRouter.unFollowUser);

// Followers
router.get("/user/followers/:id", ensureAuthenticated, userRouter.allFollowers);

module.exports = router;
