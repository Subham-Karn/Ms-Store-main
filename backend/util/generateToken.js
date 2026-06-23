const jwt = require('jsonwebtoken');
require('dotenv').config();
const generateToken = (userId) =>{
  const jwtSecret = process.env.JWT_SERCET_KEY;
  const token = jwt.sign({id: userId} , jwtSecret , {expiresIn: '7d'});
  return token;
}

module.exports = generateToken;