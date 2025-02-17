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
    passport.authenticate("local", async (err, user, info) => {
        try {
            if (err) {
                console.error("Authentication error:", err);
                return next(err);
            }
            if (!user) {
                return res.status(401).json({
                    message: info?.message || "Invalid credentials",
                    authenticated: false
                });
            }

            await new Promise((resolve, reject) => {
                req.logIn(user, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

         
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            console.log("After login session:", {
                sessionID: req.sessionID,
                user: req.user,
                session: req.session
            });

            res.json({
                success: true,
                user,
                authenticated: true,
                redirectUrl: res.locals.redirectUrl || "/talk",
                sessionID: req.sessionID 
            });
        } catch (error) {
            console.error("Login error:", error);
            next(error);
        }
    })(req, res, next);
});
router.get("/auth/check", (req, res) => {
    console.log({
        sessionID: req.sessionID,
        session: req.session,
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        cookies: req.headers.cookie
    });

    if (!req.session) {
        return res.status(440).json({ 
            authenticated: false,
            message: "Session expired"
        });
    }

   
    req.session.touch();

    if (req.isAuthenticated() && req.user) {
        return res.json({
            authenticated: true,
            user: req.user
        });
    }

    return res.json({
        authenticated: false,
        message: "Not authenticated"
    });
});
router.post('/logout', userRouter.logout);
router.get('/user/:id', ensureAuthenticated, wrapAsync(userRouter.showUsers));
router.post('/user/follow/:id', ensureAuthenticated, wrapAsync(userRouter.followUser));
router.post('/user/unfollow/:id', ensureAuthenticated, wrapAsync(userRouter.unFollowUser));
router.get('/user/followers/:id', ensureAuthenticated, wrapAsync(userRouter.allFollowers));
module.exports = router;
