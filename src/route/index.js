const { Router } = require("express");
const { validate } = require("express-validation");
const controller = require("../controller/userController");
const {
  verifyAccessToken,
  verifyRefreshToken,
} = require("../middleware/JwtToken");
const valid = require("../validation/userValidation");
const indexRouter = Router();

indexRouter.post(
  "/Register",
  validate(valid.createUserValidation),
  controller.Register
);

indexRouter.post("/login", validate(valid.loginUserValiation), controller.loginUser);

indexRouter.get("/profile", verifyAccessToken, controller.userProfile);

indexRouter.get("/generateToken", verifyRefreshToken, controller.GenerateToken);

indexRouter.get("/logout", verifyAccessToken, controller.logoutUser);

indexRouter.post(
  "/changePassword",
  validate(valid.changePasswordValidation),
  verifyAccessToken,
  controller.changePassword
);

indexRouter.post(
  "/forgotPassword",
  validate(valid.forgotPasswordValidation),
  controller.forgotPassword
);

indexRouter.post(
  "/forgotPassword/:id/:token",
  validate(valid.postForgotPasswordValidation),
  controller.postResetPassword
);

module.exports = indexRouter;
