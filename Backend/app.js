if (process.env.NODE_ENV !== "production") {
      require("dotenv").config();
}

const express = require("express");
const app = express();
const passport = require("passport");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/user");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const Post = require("./models/posts");

const PORT = 8080;
const cors = require("cors");

app.use(
    cors({
        origin: "https://talk-5cj038uxr-siddhu-niohs-projects.vercel.app/", // Ensure this is correct
        credentials: true, // Required for cookies
    })
);



// Routers
const user = require('./routes/user');
const talk = require('./routes/talk');

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
const session = require("express-session");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local").Strategy;


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
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
app.use(flash());


// Middleware to make flash messages available in views
app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user || null;
      // console.log(res.locals.currUser);
      next();
});
app.get('/currUser', (req, res) => {
      console.log("Session:", req.session);
      if (!req.user) {
            return res.status(401).json({ error: "User not authenticated" });
      }
      res.json(req.user);
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
