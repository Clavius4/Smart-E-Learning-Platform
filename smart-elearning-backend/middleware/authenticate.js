const jwt = require("jsonwebtoken");

module.exports = function authenticate(req, res, next) {
  try {
    // Allow preflight OPTIONS requests without token verification
    if (req.method === "OPTIONS") return next();

    // Priority 1: Authorization header (Bearer token)
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Priority 2: Cookie named 'token' (useful for browser flows)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Priority 3: Query param (for quick testing) - ?token=...
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g., { id, role, email }
    return next();
  } catch (err) {
    console.error('Authentication error:', err.message || err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
