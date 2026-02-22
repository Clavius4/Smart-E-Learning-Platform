const jwt = require("jsonwebtoken");

module.exports = function authenticate(req, res, next) {
  try {
    // Allow preflight OPTIONS requests without token verification
    if (req.method === "OPTIONS") {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided in Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g., { id, role, email }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
