require("dotenv").config();
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const RedisClient = require("../conn/redis");

exports.createAccessToken = (userid) => {
  const payload = userid;
  const token = jwt.sign({ payload }, process.env.ACCESS_SECRET_KEY, {
    expiresIn: "1h",
  });
  return token;
};

exports.createRefreshToken = (userid) => {
  const payload = userid;
  const refreshtoken = jwt.sign({ payload }, process.env.REFRESH_SECRET_KEY, {
    expiresIn: "365d",
  });
  RedisClient.set(userid, refreshtoken, { EX: 365 * 24 * 60 * 60 });
  return refreshtoken;
};

exports.verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(bearerToken, process.env.ACCESS_SECRET_KEY);
    req.payload = payload;
    next();
  } catch (error) {
    next(error);
  }
};

exports.verifyRefreshToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ")[1];
  try {
    const payload = await jwt.verify(
      bearerToken,
      process.env.REFRESH_SECRET_KEY
    );
    const userid = payload.payload;
    const storedToken = await RedisClient.get(userid);
    if (storedToken != bearerToken) throw createError.Unauthorized();
    req.payload = payload;
    next();
  } catch (error) {
    next(error);
  }
};
