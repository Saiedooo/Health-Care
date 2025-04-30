const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/apiError');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

// Configure multer filter
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Not an image! Please upload only images.', 400), false);
  }
};

// Configure upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload single image
exports.uploadSingleImage = (fieldName) => upload.single(fieldName);

// Process image after upload
exports.processImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    // Generate unique filename
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    // Process image
    await sharp(req.file.buffer)
      .resize(500, 500, { fit: 'contain' })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    // Add filename to request body
    req.body[req.file.fieldname] = filename;

    next();
  } catch (error) {
    next(new ApiError('Error processing image', 400));
  }
};

// Upload multiple fields
exports.uploadUserImages = upload.fields([
  { name: 'personalPhoto', maxCount: 1 },
  { name: 'idPhoto', maxCount: 1 },
  { name: 'businessCardPhoto', maxCount: 1 },
]);

// Process multiple images
exports.processAndUpload = async (req, res, next) => {
  try {
    if (!req.files) return next();

    // Process each file type if it exists
    const processPromises = Object.keys(req.files).map(async (fieldName) => {
      const file = req.files[fieldName][0];
      const filename = `user-${uuidv4()}-${Date.now()}-${fieldName}.jpeg`;

      await sharp(file.buffer)
        .resize(500, 500, { fit: 'contain' })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/users/${filename}`);

      req.body[fieldName] = filename;
    });

    await Promise.all(processPromises);
    next();
  } catch (error) {
    next(new ApiError('Error processing images', 400));
  }
};
