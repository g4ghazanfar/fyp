const jwt = require("jsonwebtoken");

function tokenFor(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ sub: user._id.toString() }, secret, { expiresIn: "30d" });
}

function publicUser(user) {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  delete value.__v;
  return { ...value, id: value._id?.toString() || value.id };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { tokenFor, publicUser, requireAuth };