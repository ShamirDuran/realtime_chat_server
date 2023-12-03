const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env.config');

/**
 * Generate JWT
 * @param {*} uid ID of the user to generate and be included in the JWT
 * @returns {Promise} Promise with the generated token
 */
const generateJWT = (payload, expirationTime) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      {
        expiresIn: expirationTime ?? jwtExpiresIn,
      },
      (err, token) => {
        if (err) {
          console.error(err);
          reject('Token could not be generated');
        } else {
          resolve(token);
        }
      }
    );
  });
};

const validateJWT = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return [true, decoded];
  } catch (error) {
    return [false, null];
  }
};

module.exports = {
  generateJWT,
  validateJWT,
};
