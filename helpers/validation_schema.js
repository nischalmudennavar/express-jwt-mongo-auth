const joi = require("@hapi/joi");

const authSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
});

module.exports = {
  authSchema,
};
