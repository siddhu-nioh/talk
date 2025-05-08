const jwt = require("jsonwebtoken");
const User = require("./models/user");

module.exports.ensureAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from header

    if (!token) {
        console.warn("Unauthorized access attempt: No token provided");
        return res.status(401).json({ message: "Unauthorized", authenticated: false });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
            console.warn("Unauthorized access: User not found");
            return res.status(401).json({ message: "User not found", authenticated: false });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication error:", err.message);
        res.status(401).json({ message: "Invalid token", authenticated: false });
    }
};

// module.exports.validateMedia = (req, res, next) => {
//     const image = req.files?.image ? req.files.image[0].path : null;
//     const video = req.files?.video ? req.files.video[0].path : null;
//     if (!image && !video) {
//         return res.status(400).json({ message: "Either an image or video must be provided" });
//     }
//     req.media = { image, video };
//     next();
// };

module.exports.validateMedia = (req, res, next) => {
    const image = req.files?.image?.[0]?.secure_url || null;
    const video = req.files?.video?.[0]?.secure_url || null;
    console.log("🧾 Full image file info:", req.files?.image?.[0]);


    if (!image && !video) {
        return res.status(400).json({ message: "Either an image or video must be provided" });
    }

    req.media = { image, video };
    console.log(" Uploaded media:", req.media);
    next();
};


module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.ensureAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    if (req.user.role !== "admin") {
        console.warn(`Unauthorized admin access attempt by user ${req.user._id}`);
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
};