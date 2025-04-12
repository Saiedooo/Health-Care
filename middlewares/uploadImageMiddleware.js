const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `user-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadSingleImage = (fieldName) => {
  const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image')) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed'));
      }
    }
  });
  return upload.single(fieldName);
};

module.exports = { uploadSingleImage };