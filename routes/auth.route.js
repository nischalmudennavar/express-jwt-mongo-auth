const express = require("express");
const router = express.Router();
const createError = require("http-errors");

const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");

const { authSchema } = require("../helpers/validation_schema");

const User = require("../models/user.model");

router.post("/register", async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    console.log(result);
    const existingUser = await User.findOne({ email: result.email });
    if (existingUser) {
      throw createError.Conflict(`${result.email} already exists`);
    } else {
      const user = new User(result);
      const savedUser = await user.save();
      // create an accessToken for the user
     
      const accessToken = await signAccessToken(savedUser._id);
      const refreshToken = await signRefreshToken(savedUser._id);
      res.send({ accessToken, refreshToken });
      res.send(savedUser._id);
    }
  } catch (error) {
    if (error.isJoi === true) {
      error.status = 422;
    } else {
      next(error);
    }
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });
    if (!user) throw createError.NotFound("User not found");
    const isMatch = await user.isValidPassword(result.password);

    if (!isMatch) throw createError.Unauthorized("Invalid password");

    // create an accessToken for the user after login to make requests ( this access token goes to client )

    const accessToken = await signAccessToken(user._d);
    const refreshToken = await signRefreshToken(user._d);

    res.send({ message: "login successfull", accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
});

router.delete("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const deleted = await User.findOneAndDelete({ _d: userId });
    res.send(deleted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
