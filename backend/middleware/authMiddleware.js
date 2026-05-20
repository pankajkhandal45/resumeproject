import jwt from 'jsonwebtoken';

export const protect = (roles = []) => {
  return (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
      try {
        token = token.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(403).json({ message: 'Forbidden' });
        }
        
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  };
};
