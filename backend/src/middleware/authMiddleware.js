const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware — verifies the JWT token in the Authorization header.
 * Usage: add `protect` before any route handler you want to protect.
 *
 * Example:
 *   router.get("/me", protect, (req, res) => res.json(req.user));
 */
const protect = async (req, res, next) => {
  let token;

  // Token should arrive as: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized — no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user (without password) to the request
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized — token invalid" });
  }
};

module.exports = { protect };
