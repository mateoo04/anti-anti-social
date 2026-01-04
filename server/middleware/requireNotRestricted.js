function requireNotRestricted(req, res, next) {
  if (req.user?.isRestricted) {
    return res.status(403).json({ message: "Account restricted" });
  }
  next();
}
module.exports = { requireNotRestricted };
