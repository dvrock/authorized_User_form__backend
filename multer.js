const multer = require("multer");
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const url = `${__dirname}/uploads/`;
    cb(null, url);
  },
  filename(req, file, cb) {
    file.originalname = "re_" + file.originalname;
    cb(null, `${file.originalname}`);
  },
});
const uploadImg = multer({
  storage: storage,
});

exports.uploadImg = uploadImg;
