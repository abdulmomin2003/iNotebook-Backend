const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
  // Get the token from the request header
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user details to the request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = fetchUser;
