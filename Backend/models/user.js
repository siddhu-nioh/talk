const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

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
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
