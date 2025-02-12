const express = require('express');
const router = express.Router();
const userRouter = require("../controllers/user")
const passport = require('passport');
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl, ensureAuthenticated } = require("../middleware");
const upload = require('../cloudConfig');
router.get('/signup', userRouter.renderSignup);
router.post('/signup', upload, wrapAsync(userRouter.signup));
router.get('/login', userRouter.renderLogin);
router.post('/login', saveRedirectUrl, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info.message || "Invalid credentials", authenticated: false });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            console.log("Authenticated User:", user);
            res.json({ success: true, user, authenticated: true, redirectUrl: res.locals.redirectUrl || "/talk" });
        });
    })(req, res, next);
});
router.get("/auth/check", (req, res) => {
    
    console.log("User:", req.user);
    if (req.isAuthenticated()) {
        return res.json({ authenticated: true, user: req.user });
    } else {
        return res.json({ authenticated: false });
    }
});
router.get('/logout', userRouter.logout);
router.get('/user/:id', ensureAuthenticated, wrapAsync(userRouter.showUsers));
router.post('/user/follow/:id', ensureAuthenticated, wrapAsync(userRouter.followUser));
router.post('/user/unfollow/:id', ensureAuthenticated, wrapAsync(userRouter.unFollowUser));
router.get('/user/followers/:id', ensureAuthenticated, wrapAsync(userRouter.allFollowers));
module.exports = router;
