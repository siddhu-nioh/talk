if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const cors = require("cors");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");

const User = require("./models/user");
const Post = require("./models/posts");


app.use(
    cors({
        origin: "https://talk-99vcwb2mu-siddhu-niohs-projects.vercel.app",
        credentials: true, 
    })
);


const dbUrl = process.env.ATLASDB_URL;
mongoose
    .connect(dbUrl)
    .then(() => {
        console.log(" Connected to DB");
        initializeSession(); 
    })
    .catch((err) => console.error("Database connection error:", err));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);


let store;
function initializeSession() {
    store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: { secret: process.env.SECRET || "secretKey" },
        touchAfter: 24 * 60 * 60,
    });

    store.on("error", (err) => console.error("Session Store Error:", err));


    const sessionOptions = {
        store,
        secret: process.env.SECRET || "secretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "lax", 
            maxAge: 1000 * 60 * 60 * 24 * 7, 
        },
    };

    app.use(session(sessionOptions));
    app.use(passport.initialize());
    app.use(passport.session());
}

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        if (err) return done(err);
        console.log("🔄 Restoring User from Session:", user);
        done(null, user);
    });
});

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});


app.get('/debug/session', (req, res) => {
    console.log("🛠️ Debug Session Data:", req.session);
    res.json(req.session);
});


app.get('/currUser', (req, res) => {
    console.log("🔎 Checking Logged-In User:", req.user);
    if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
    }
    res.json(req.user);
});


const userRoutes = require('./routes/user');
const talkRoutes = require('./routes/talk');
app.use('/', userRoutes);
app.use('/talk', talkRoutes);


app.get("/", (req, res) => {
    res.redirect("/talk");
});


app.use((err, req, res, next) => {
    console.error("🔥 Error:", err.stack);
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).render("error", { err });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
