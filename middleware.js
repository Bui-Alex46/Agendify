// middleware.js
function requireLogin(req, res, next) {
  console.log('Session in middleware:', req.session);
    if (!req.session.user) {
      
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    next();
  }
  
  module.exports = { requireLogin };
  