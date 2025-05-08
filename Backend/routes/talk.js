const express = require('express');
// const router = express.Router();
// const talkRouter=require('../controllers/talk');
// const wrapAsync=require('../utils/wrapAsync');
// const {ensureAuthenticated,validateMedia}=require('../middleware')

// router.get('/', talkRouter.renderIndex);
// router.get('/new',ensureAuthenticated,talkRouter.renderNew);
// router.get('/search',ensureAuthenticated,talkRouter.renderSearch);
// router.get('/user',talkRouter.renderUser);
// router.post('/',ensureAuthenticated, upload,validateMedia, wrapAsync(talkRouter.postUpload));
// router.get('/search/users',wrapAsync(talkRouter.searchUsers));

// module.exports = router;// routes/talk.jsconst express = require('express');
const router = express.Router();
const upload = require('../cloudConfig');
const talkRouter = require('../controllers/talk');
const wrapAsync = require('../utils/wrapAsync');
const { ensureAuthenticated, validateMedia } = require('../middleware');

router.get('/', wrapAsync(talkRouter.renderIndex));
router.get('/new', ensureAuthenticated, talkRouter.renderNew);
router.get('/search', ensureAuthenticated, talkRouter.renderSearch);
router.get('/user', talkRouter.renderUser);

// Fix: Ensure each middleware is properly defined and the controller method exists
router.post('/', 
    ensureAuthenticated,
    upload,  // This should be your multer middleware defined in cloudConfig.js
    validateMedia,
    wrapAsync(talkRouter.postUpload)
);

router.get('/search/users', wrapAsync(talkRouter.searchUsers));

// New routes for likes and comments
router.post('/:postId/like', ensureAuthenticated, wrapAsync(talkRouter.likePost));
router.post('/:postId/comment', ensureAuthenticated, wrapAsync(talkRouter.addComment));

module.exports = router;