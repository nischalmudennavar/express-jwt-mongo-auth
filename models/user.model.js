const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema;

const userSchema = new schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function (next) {
  try {
    console.log("before saving a user ");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.post("save", function (error, doc, next) {
  try {
    console.log("after saving a user ");
    if (error.code === 11000) {
      next(new Error("Email already exists"));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};
const User = mongoose.model("user", userSchema);

module.exports = User;
