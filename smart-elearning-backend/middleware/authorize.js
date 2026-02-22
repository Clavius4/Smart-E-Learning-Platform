module.exports = function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    const allowed = allowedRoles.map(role => role.toLowerCase());

    console.log(`🔐 Authorization Check:`, {
      userRole,
      allowedRoles: allowed,
      userId: req.user?.id,
      email: req.user?.email
    });

    if (!allowed.includes(userRole)) {
      console.log(`❌ Access denied: ${userRole} not in [${allowed.join(', ')}]`);
      return res.status(403).json({ message: "Access denied" });
    }

    console.log(`✅ Access granted for role: ${userRole}`);
    next();
  };
};
