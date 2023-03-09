const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const route = require("./routes/userRoutes");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
//prevent paramater pollution
app.use(hpp());
//stop headers attack
app.use(helmet());
//stop frm going hacker into html file using inline javascript
app.use(xss());
//stope no sql query injection
app.use(mongoSanitize());
//Global Middleware
const limiter = rateLimit({
  max: 2,
  windowMs: 60 * 60 * 1000,
  message: "too many request from this IP, please try on a hour !",
});
app.use("/todo", limiter);
app.use(express.json());
app.use("/todo", route);

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => {
  console.log("db connection sucessfull");
});

app.listen("3000", () => {
  console.log("connected");
});
