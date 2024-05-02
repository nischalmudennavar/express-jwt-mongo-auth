const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const redis_client = require("./init.redis");
const { string } = require("@hapi/joi");

module.exports = {
  // create a new accessToken
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "15s",
        issuer: "nischal.work",
        audience: String(userId), // Convert userId to a string
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },

  // verify the authorization token ( accessToken )
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message = err.name === "JsonWebTokenError" ? " " : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = payload;
      next();
    });
  },

  // create a new refreshToken
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "nischal.work",
        audience: String(userId), // Convert userId to a string
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
        } else {
          // redis_client.set(userId, token, "EX", 365 * 24 * 60 * 60, (err, reply) => {
          //   if (err) {
          //     console.log(err.message);
          //     reject(createError.InternalServerError());
          //   }
            resolve(token);
          //
        }
      });
    });
  },

  // verify the refreshToken
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized());
          const userId = String(payload.aud);
          console.log(userId);
          resolve(userId);
        }
      );
    });
  },
};
