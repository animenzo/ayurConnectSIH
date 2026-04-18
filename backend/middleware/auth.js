const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // CHANGE THIS: Use 'user' instead of 'doctor'
    // This allows both req.user.id and req.user.role to work for everyone
    req.user = decoded; 
    
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};