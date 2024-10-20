// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please log in first." });
  }
}

module.exports = { isAuthenticated };
