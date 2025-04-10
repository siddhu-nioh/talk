const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JWTs

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, "Please provide a valid email address"],
    },
    profile: {
        type: String,
        default: "https://res.cloudinary.com/dvykfqu85/image/upload/v1737733131/Talk_Test/mj2vlw57rmwvxmgky1ve.webp",
        set: (v) => v === "" ? "https://res.cloudinary.com/dvykfqu85/image/upload/v1737733131/Talk_Test/mj2vlw57rmwvxmgky1ve.webp" : v,
    },
    password: {
        type: String,
        required: true, 
    },
    salt: {
        type: String, 
    },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.salt = await bcrypt.genSalt(10); // Generate salt
        this.password = await bcrypt.hash(this.password, this.salt); // Hash password
    }
    next();
});

// Generate JWT
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "7d", // Token expires in 7 days
    });
};

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
