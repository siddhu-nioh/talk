const express = require('express');
const router = express.Router();
const upload = require('../cloudConfig');
const talkRouter=require('../controllers/talk');
const wrapAsync=require('../utils/wrapAsync');
const {ensureAuthenticated,validateMedia}=require('../middleware')

router.get('/', talkRouter.renderIndex);
router.get('/new',ensureAuthenticated,talkRouter.renderNew);
router.get('/search',ensureAuthenticated,talkRouter.renderSearch);
router.get('/user',talkRouter.renderUser);
router.post('/',ensureAuthenticated, upload,validateMedia, wrapAsync(talkRouter.postUpload));
router.get('/search/users',wrapAsync(talkRouter.searchUsers));

module.exports = router;
