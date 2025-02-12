module.exports.isLoggedIn = (req, res, next) => {
      if (req.isAuthenticated && req.isAuthenticated()) {
            return next();
      }
      req.flash('error', 'You must be logged in to access this page!');
      return res.redirect('/login');
};


module.exports.ensureAuthenticated = (req, res, next) => {
      if (req.isAuthenticated()) {
            res.locals.currUser = req.user;
            return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
};

module.exports.validateMedia = (req, res, next) => {
      const image = req.files?.image ? req.files.image[0].path : null;
      const video = req.files?.video ? req.files.video[0].path : null;
      if (!image && !video) {
            req.flash("error", "Either an image or video must be provided.");
            return res.redirect("/talk/new");
      }
      req.media = { image, video };
      next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
      if (req.session.redirectUrl) {
            res.locals.redirectUrl = req.session.redirectUrl;
      }
      next();
}