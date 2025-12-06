const { CookieJar } = require('tough-cookie');

 const cookieHandler = (req, res, next) => {
  req.cookieJar = new CookieJar();
  next();
};

module.exports = cookieHandler