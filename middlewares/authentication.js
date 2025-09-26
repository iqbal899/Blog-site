const { validateToken } = require("../services/authentication");

// Populate req.user and res.locals.user
function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];

    if (!tokenCookieValue) {
      req.user = null;
      res.locals.user = null;
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
      res.locals.user = userPayload;
    } catch (err) {
      req.user = null;
      res.locals.user = null;
    }

    next();
  };
}

// Protect routes (user must be logged in)
function isAuthenticated(req, res, next) {
  if (!req.user) return res.redirect("/user/login"); // redirect if not logged in
  next();
}

module.exports = { checkForAuthenticationCookie, isAuthenticated };
