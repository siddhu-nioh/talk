// const jwt = require("jsonwebtoken");
// const User = require("./models/user");

// module.exports.ensureAuthenticated = async (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1]; // Get token from header

//     if (!token) {
//         console.warn("Unauthorized access attempt: No token provided");
//         return res.status(401).json({ message: "Unauthorized", authenticated: false });
//     }

//     try {
//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Find user by ID
//         const user = await User.findById(decoded._id).select("-password");
//         if (!user) {
//             console.warn("Unauthorized access: User not found");
//             return res.status(401).json({ message: "User not found", authenticated: false });
//         }

//         // Attach user to request object
//         req.user = user;
//         next();
//     } catch (err) {
//         console.error("Authentication error:", err.message);
//         res.status(401).json({ message: "Invalid token", authenticated: false });
//     }
// };

// // module.exports.validateMedia = (req, res, next) => {
// //     const image = req.files?.image ? req.files.image[0].path : null;
// //     const video = req.files?.video ? req.files.video[0].path : null;
// //     if (!image && !video) {
// //         return res.status(400).json({ message: "Either an image or video must be provided" });
// //     }
// //     req.media = { image, video };
// //     next();
// // };

// const validateMedia = (req, res, next) => {
//     console.log("🔍 Validating media in request:", req.file, req.files);
    
//     let image = null;
//     let video = null;
    
//     // Check if we have a single file from multer
//     if (req.file) {
//       if (req.file.mimetype.startsWith('image/')) {
//         image = req.file.path || req.file.secure_url;
//       } else if (req.file.mimetype.startsWith('video/')) {
//         video = req.file.path || req.file.secure_url;
//       }
//     } 
//     // Check if we have files object from multer
//     else if (req.files) {
//       // Handle array format
//       if (Array.isArray(req.files)) {
//         const imageFile = req.files.find(f => f.mimetype.startsWith('image/'));
//         const videoFile = req.files.find(f => f.mimetype.startsWith('video/'));
        
//         if (imageFile) image = imageFile.path || imageFile.secure_url;
//         if (videoFile) video = videoFile.path || videoFile.secure_url;
//       } 
//       // Handle object format
//       else {
//         if (req.files.image) {
//           const imageFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
//           image = imageFile.path || imageFile.secure_url;
//         }
//         if (req.files.video) {
//           const videoFile = Array.isArray(req.files.video) ? req.files.video[0] : req.files.video;
//           video = videoFile.path || videoFile.secure_url;
//         }
//       }
//     }
    
//     console.log("📷 Extracted image:", image);
//     console.log("🎬 Extracted video:", video);
    
//     if (!image && !video) {
//       return res.status(400).json({ message: "Either an image or video must be provided" });
//     }
    
//     req.media = { image, video };
//     console.log("🔄 Final media object:", req.media);
//     next();
//   };


// module.exports.saveRedirectUrl = (req, res, next) => {
//     if (req.session.redirectUrl) {
//         res.locals.redirectUrl = req.session.redirectUrl;
//     }
//     next();
// };

// module.exports.ensureAdmin = (req, res, next) => {
//     if (!req.user) {
//         return res.status(401).json({ message: "Unauthorized: No user found" });
//     }

//     if (req.user.role !== "admin") {
//         console.warn(`Unauthorized admin access attempt by user ${req.user._id}`);
//         return res.status(403).json({ message: "Forbidden: Admin access required" });
//     }

//     next();
// };
// middleware.js 
const jwt = require("jsonwebtoken");
const User = require("./models/user");

module.exports.ensureAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from header
    
    console.warn(" access attempt:  token provided");
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

module.exports.validateMedia = (req, res, next) => {
    // Allow posts with no media (text-only posts)
    
    console.warn(" access attempt:  provided");
    if (!req.files || (Object.keys(req.files).length === 0 && !req.body.description)) {
      return res.status(400).json({ 
        message: "Please provide either media (image/video) or a description" 
      });
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