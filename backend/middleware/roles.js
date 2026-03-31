const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    
    const userRole = req.session.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Forbidden. You do not have permission to access this resource.' 
      });
    }
    
    next();
  };
};

module.exports = requireRole;
