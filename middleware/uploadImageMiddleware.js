const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { put } = require('@vercel/blob');
const ApiError = require('../utils/apiError');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

// Configure multer filter
const multerFilter = (req, file, cb) => {
  try {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Not an image! Please upload only images.', 400), false);
    }
  } catch (error) {
    console.error('Multer filter error:', error);
    cb(new ApiError('Error processing file type', 400), false);
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
    if (!req.file) {
      console.log('No file uploaded');
      return next();
    }

    console.log('Processing file:', req.file.originalname);
    console.log('File mimetype:', req.file.mimetype);
    console.log('File size:', req.file.size);

    // Generate unique filename
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
    console.log('Generated filename:', filename);

    // Process image with Sharp
    const processedBuffer = await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log('Image processed successfully');

    // For development/testing, save locally if VERCEL_ENV is not set
    if (!process.env.VERCEL_ENV) {
      const fs = require('fs');
      const path = require('path');

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'users');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save locally
      const localPath = path.join(uploadDir, filename);
      fs.writeFileSync(localPath, processedBuffer);
      req.body[req.file.fieldname] = `/uploads/users/${filename}`;
      console.log('Image saved locally:', localPath);
      return next();
    }

    // Upload to Vercel Blob if in production
    console.log('Uploading to Vercel Blob...');
    const { url } = await put(filename, processedBuffer, {
      access: 'public',
    });

    console.log('Upload successful, URL:', url);
    req.body[req.file.fieldname] = url;
    next();
  } catch (error) {
    console.error('Detailed error in processImage:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    next(new ApiError(`Error processing image: ${error.message}`, 400));
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
    if (!req.files) {
      console.log('No files uploaded for multiple upload');
      return next();
    }

    // Process each file type if it exists
    const processPromises = Object.keys(req.files).map(async (fieldName) => {
      const file = req.files[fieldName][0];
      console.log(`Processing ${fieldName}:`, file.originalname);

      const filename = `user-${uuidv4()}-${Date.now()}-${fieldName}.jpeg`;

      // Process image with Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(500, 500, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

      // For development/testing
      if (!process.env.VERCEL_ENV) {
        const fs = require('fs');
        const path = require('path');

        const uploadDir = path.join(process.cwd(), 'uploads', 'users');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const localPath = path.join(uploadDir, filename);
        fs.writeFileSync(localPath, processedBuffer);
        req.body[fieldName] = `/uploads/users/${filename}`;
        return;
      }

      // Upload to Vercel Blob if in production
      const { url } = await put(filename, processedBuffer, {
        access: 'public',
      });

      req.body[fieldName] = url;
    });

    await Promise.all(processPromises);
    next();
  } catch (error) {
    console.error('Detailed error in processAndUpload:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    next(new ApiError(`Error processing images: ${error.message}`, 400));
  }
};
