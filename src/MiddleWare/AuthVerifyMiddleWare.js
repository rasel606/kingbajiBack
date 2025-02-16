const jwt = require("jsonwebtoken");


exports.authMiddleware = (req, res, next) => {
    exports.verify=(req, res) => {
      const token = req.header('Authorization');
      if (!token) return res.status(401).send({ message: 'Access denied!' });
    
      try {
        const decoded = jwt.verify(token, "Kingbaji");
        res.status(200).send({ message: 'User authenticated', userId: decoded.id });
      } catch (error) {
        res.status(400).send({ message: 'Invalid token!' });
      }
    }
};
