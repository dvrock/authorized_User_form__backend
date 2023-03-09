const User = require("../models/User");
const session = require("express-session");
const bcrypt = require("bcrypt");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const jwt = require("jsonwebtoken");

app.use(cookieParser());
module.exports = {
  verifyToken: async (req, res, next) => {
    const verify = req.headers["authorization"];
    if (!verify) return res.status(401).send("unauthorized user");
    const bearer = verify.split(" ");
    req.token = bearer[1];
    const authData = await jwt.verify(req.token, process.env.JWT_SECRET);
    next();
  },
  Register: async (req, res) => {
    // const queryObj = {  };
    // // const excludedFields = ["page", "sort", "limit", "fields"];
    // // excludedFields.forEach((el) => delete queryObj[el]);
    // // let queryStr = JSON.stringify(queryObj);/^S/ select all words start with letter s
    // // queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // let query = User.find(JSON.parse(queryObj));
    // console.log(JSON.parse(queryStr));
    try {
      const { firstname, lastname, email, password } = req.body;
      const encryptedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firstname,
        lastname,
        email,
        password: encryptedPassword,
      });

      const user = await newUser.save();
      // let options = {
      //   maxAge: 1000 * 60 * 15, // would expire after 15 minutes
      //   httpOnly: true, // The cookie only accessible by the web server
      //   signed: false, // Indicates if the cookie should be signed
      // };
      // res.cookie("cookie", "{name:'usama',age:23}", options);
      res.status(201).json({
        message: "done",
        data: user,
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  Login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const getUsers = await User.findOne({ email }).select("password");
      const verify = await bcrypt.compare(password, getUsers.password);
      if (verify) {
        const token = jwt.sign({ id: getUsers._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        res.status(201).json({
          status: "successfull",
          userLength: getUsers.length,
          data: getUsers,
        });
      } else {
        res.status(500).json({
          status: "500",
          data: "bad request",
        });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  SignIn: async (req, res) => {
    
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    }
    res.cookie("cookie", "{name:'usama',age:23}", cookieOptions);
    res.json({
      status: "file uploaded",
      message: ` uploaded`,
    });
  },

  updateUser: async (req, res) => {
    try {
      const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updateUser) {
        res.status(404).json({
          status: "updated",
          message: `user is updated with  id ${req.params.id}`,
        });
      } else {
        res.status(200).json({
          status: "successfull",
          data: updateUser,
        });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  deleteUser: async (req, res) => {
    try {
      const deleteUser = await User.findByIdAndDelete(req.params.id);
      const allUsers = await User.find();
      if (!deleteUser) {
        res.status(404).json({
          status: "deleted",
          message: `user deleted with id = ${req.params.id}`,
        });
      } else {
        res.status(200).json({
          status: "successfull",
          data: allUsers,
        });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  clearUser: async (req, res) => {
    try {
      const clearUser = await User.deleteMany();
      if (!clearUser) {
        res.status(404).json({
          status: "deleted",
          message: "All users are not deleted",
        });
      } else {
        res.status(200).json({
          status: "successfull",
          data: clearUser,
        });
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};
