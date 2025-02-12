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
const User = require("./models/user");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const Post = require("./models/posts");
const cors = require("cors");

const PORT = 8080;

// CORS configuration
const allowedOrigins = [
    "https://talk-99vcwb2mu-siddhu-niohs-projects.vercel.app",
    "http://localhost:3000", // Add localhost for development
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // Required for cookies
    })
);

// Database connection
const dbUrl = process.env.ATLASDB_URL;
mongoose
    .connect(dbUrl)
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.error("Database connection error:", err));

// Middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

// Session store
const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 60 * 60,
});

store.on("set", (sessionId) => {
    console.log("Session saved:", sessionId); // Log when a session is saved
});

store.on("get", (sessionId) => {
    console.log("Session retrieved:", sessionId); // Log when a session is retrieved
});

store.on("error", (err) => {
    console.error("Session store error:", err); // Log any session store errors
});

// Session configuration
app.use(
    session({
        store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only true in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin in production
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        },
    })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Local strategy
passport.use(new LocalStrategy(User.authenticate()));

// Serialization/deserialization
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user); // Log the user being serialized
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log("Deserializing user with ID:", id); // Log the user ID being deserialized
        const user = await User.findById(id);
        console.log("Deserialized User:", user); // Log the retrieved user
        done(null, user);
    } catch (err) {
        console.error("Deserialization error:", err); // Log any errors
        done(err);
    }
});

// Flash messages
app.use(flash());

// Middleware to make flash messages available in views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// Routers
app.use('/', user);
app.use('/talk', talk);

app.get("/", (req, res) => {
    res.redirect("/talk");
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).render("error", { err });
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
