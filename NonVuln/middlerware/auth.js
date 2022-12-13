const User = require('../models/user');
const expressJwt = require('express-jwt');
const secretKey = 'SwathiSecretKey';

exports.requireSignin = expressJwt({
  secret: secretKey,
  algorithms: ['HS256'],
  userProperty: 'auth' }), (req, res) => {
    return res.status(403).json({ error: "Not Signed IN" })
};

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile.email == req.auth.email;
  if(!user) {
    return res.status(403).json({
      error: "Access denied!"
    });
  }
  next();
}
