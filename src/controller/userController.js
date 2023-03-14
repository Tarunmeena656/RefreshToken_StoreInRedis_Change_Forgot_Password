require("dotenv").config();
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const {
  createAccessToken,
  createRefreshToken,
} = require("../middleware/JwtToken");
const RedisClient = require("../conn/redis");

exports.Register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existUser = await userModel.findOne({ email });
    if (existUser) throw createError.Conflict("Email Already Exist");
    const user = await userModel.create({ username, email, password });
    res.status(200).json({
      message: "User Created Successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existUser = await userModel.findOne({ email });
    if (!existUser) throw createError.Unauthorized("Invalid email");
    const validatePassword = await existUser.comparePassword(password);
    if (!validatePassword) throw createError.Unauthorized("Invalid password");
    const accessToken = createAccessToken(existUser._id.toString());
    const refreshToken = createRefreshToken(existUser._id.toString());
    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

exports.userProfile = async (req, res, next) => {
  try {
    const userid = req.payload.payload;
    console.log(userid);
    const user = await userModel.findById(userid);
    res.status(200).json({ message: "Profile Information:", user });
  } catch (error) {
    next(error);
  }
};

exports.GenerateToken = async (req, res, next) => {
  try {
    const userid = req.payload.payload;
    const accessToken = createAccessToken(userid.toString());
    const refreshToken = createRefreshToken(userid.toString());
    RedisClient.set(userid, refreshToken, { EX: 365 * 24 * 60 * 60 });
    res.json({ accessToken, refreshToken });
    res.json("fine");
  } catch (error) {
    next(error);
  }
};

exports.logoutUser = async (req, res, next) => {
  try {
    const userid = req.payload.payload;
    RedisClient.del(userid);
    res.send("Deleted");
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { email, password, newPassword } = req.body;
    const existUser = await userModel.findOne({ email });
    if (!existUser) throw createError.Unauthorized("Invalid email");
    const validatePassword = await existUser.comparePassword(password);
    if (!validatePassword) throw createError.Unauthorized("Invalid password");
    const updatePassword = await bcrypt.hash(newPassword, 10);

    await userModel.findByIdAndUpdate(
      existUser._id,
      { password: updatePassword },
      { new: true }
    );
    res.status(200).json("successfully updated");
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userExist = await userModel.findOne({ email }).lean();
    if (!userExist) throw createError.NotFound();

    const secret = process.env.ACCESS_SECRET_KEY + userExist.password;
    const payload = {
      email: userExist.email,
      _id: userExist._id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "10m" });
    const link = `http://localhost:8000/forgotPassword/${userExist._id}/${token}`;
    res.json({ resetLink: link });
  } catch (error) {
    next(error);
  }
};

exports.postResetPassword = async (req, res, next) => {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;
  const userExist = await userModel.findOne({ _id: id });
  if (!userExist) throw createError.NotFound();
  const secret = process.env.ACCESS_SECRET_KEY + userExist.password;
  try {
    const payload = jwt.verify(token, secret);
    if (password != confirmPassword) return res.send("Password not Match");
    const userFound = await userModel.findOne({
      _id: payload._id,
      email: payload.email,
    });
    if (userFound) {
      const changePassword = await bcrypt.hash(password, 10);
      const updateUser = await userModel.findByIdAndUpdate(
        { _id: payload._id },
        { $set: { password: changePassword } }
      );
      res.send("Password Changed Successfully");
    }
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};
