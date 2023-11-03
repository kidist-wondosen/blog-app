const multer = require("multer");
const { v4: uuid } = require("uuid");

const MIMETYPE = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
};

module.exports = multer({
  fileFilter: (req, file, cb) => {
    const imgIsValid = !!MIMETYPE[file.mimetype];
    const err = imgIsValid ? null : new Error("Image is invalid");
    cb(err, imgIsValid);
  },
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const ext = MIMETYPE[file.mimetype];
      cb(null, `${uuid()}.${ext}`);
    },
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
  }),
});
