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
        if (err) {
            console.error("Authentication error:", err);
            return next(err);
        }
        
        if (!user) {
            console.log("Authentication failed:", info?.message);
            return res.status(401).json({ 
                message: info?.message || "Invalid credentials", 
                authenticated: false 
            });
        }
        
        req.logIn(user, async (err) => {
            if (err) {
                console.error("Login error:", err);
                return next(err);
            }
            
            // Explicitly set passport data in session
            req.session.passport = { user: user._id };
            
            // Force session save and wait for it
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log("Login successful. Session ID:", req.sessionID);
            console.log("Session data:", req.session);
            
            res.json({ 
                success: true, 
                user, 
                authenticated: true,
                redirectUrl: res.locals.redirectUrl || "/talk"
            });
        });
    })(req, res, next);
});

router.get("/auth/check", (req, res) => {
    console.log("Auth Check - Session ID:", req.sessionID);
    console.log("Session data:", {
        ...req.session,
        cookie: req.session?.cookie,
        passport: req.session?.passport
    });
    console.log("Is Authenticated:", req.isAuthenticated());
    console.log("User:", req.user);
    
    // Touch session to prevent expiry
    req.session.touch();
    
    if (req.isAuthenticated() && req.user) {
        return res.json({ 
            authenticated: true, 
            user: req.user,
            sessionID: req.sessionID 
        });
    }
    
    return res.json({ 
        authenticated: false,
        sessionID: req.sessionID,
        message: "No authenticated user found"
    });
});
router.get('/logout', userRouter.logout);
router.get('/user/:id', ensureAuthenticated, wrapAsync(userRouter.showUsers));
router.post('/user/follow/:id', ensureAuthenticated, wrapAsync(userRouter.followUser));
router.post('/user/unfollow/:id', ensureAuthenticated, wrapAsync(userRouter.unFollowUser));
router.get('/user/followers/:id', ensureAuthenticated, wrapAsync(userRouter.allFollowers));
module.exports = router;
