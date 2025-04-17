// const multer = require('multer');

// const ApiError = require('../utils/apiError');

// const multerOptions = () => {
//   //disk Storage solution

//   // there is a point if u want storage abuffer u should use sharp and memeory storage to do img process
//   // const multerStorage = multer.diskStorage({
//   //     destination: function(req,res,cb) {
//   //         cb(null,'uploads/categories')
//   //     },
//   //     filename:function(req,file,cb){

//   //         // to do this --> category-id-date-jpeg
//   //         const ext = file.mimetype.split('/')[1] //consolelog file.mimetype will do image/jpeg
//   //         const filename = `category-${uuidv4()}-${Date.now()}.${ext}`
//   //          cb(null,filename) //here return the callback and pass null for no error and teh filename
//   //     }
//   // })
//   const multerStorage = multer.memoryStorage();

//   const multerFilter = function (req, file, cb) {
//     if (file.mimetype.startsWith('image')) {
//       cb(null, true);
//     } else {
//       cb(new ApiError(`Only image Allowed`, 400, false));
//     }
//   };

//   const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
//   return upload;
// };

// exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

// exports.uploadMixOfImages = (arrayOfFields) =>
//   multerOptions().fields(arrayOfFields);

// exports.uploadUserImages = () =>
//   multerOptions().fields([
//     { name: 'personalPhoto', maxCount: 1 },
//     { name: 'idPhoto', maxCount: 1 },
//     { name: 'businessCardPhoto', maxCount: 1 },
//   ]);

// File: routes/upload.js
// import { put } from '@vercel/blob';
// import express from 'express';
// import multer from 'multer';

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Process file with Sharp (optional)
//     const processedBuffer = await sharp(req.file.buffer)
//       .resize(800, 600)
//       .jpeg({ quality: 80 })
//       .toBuffer();

//     // Upload to Vercel Blob
//     const { url } = await put(
//       `uploads/${Date.now()}-${req.file.originalname}`,
//       processedBuffer,
//       { access: 'public' }
//     );

//     res.json({ success: true, url });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;

// const multer = require('multer');
// const { put } = require('@vercel/blob');
// const sharp = require('sharp');
// const ApiError = require('../utils/apiError');

// const upload = multer({ storage: multer.memoryStorage() });

// const processAndUploadImage = async (file, folder = 'users') => {
//   try {
//     // Process image with Sharp
//     const processedBuffer = await sharp(file.buffer)
//       .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
//       .jpeg({ quality: 80 })
//       .toBuffer();

//     // Upload to Vercel Blob
//     const { url } = await put(
//       `${folder}/${Date.now()}-${file.originalname}`,
//       processedBuffer,
//       { access: 'public' }
//     );

//     return url;
//   } catch (error) {
//     throw new ApiError(`Error processing image: ${error.message}`, 400);
//   }
// };

// exports.uploadSingleImage = (fieldName) => {
//   return async (req, res, next) => {
//     upload.single(fieldName)(req, res, async (err) => {
//       if (err) {
//         return next(new ApiError(err.message, 400));
//       }

//       if (!req.file) {
//         return next(new ApiError(`Please upload an image`, 400));
//       }

//       try {
//         const imageUrl = await processAndUploadImage(req.file);
//         req.body[fieldName] = imageUrl;
//         next();
//       } catch (error) {
//         next(error);
//       }
//     });
//   };
// };

// exports.uploadMixOfImages = (arrayOfFields) => {
//   return async (req, res, next) => {
//     upload.fields(arrayOfFields)(req, res, async (err) => {
//       if (err) {
//         return next(new ApiError(err.message, 400));
//       }

//       try {
//         const uploadPromises = Object.keys(req.files).map(async (fieldName) => {
//           const imageUrl = await processAndUploadImage(req.files[fieldName][0]);
//           req.body[fieldName] = imageUrl;
//         });

//         await Promise.all(uploadPromises);
//         next();
//       } catch (error) {
//         next(error);
//       }
//     });
//   };
// };

// exports.uploadUserImages = () => {
//   const fields = [
//     { name: 'personalPhoto', maxCount: 1 },
//     { name: 'idPhoto', maxCount: 1 },
//     { name: 'businessCardPhoto', maxCount: 1 },
//   ];

//   return exports.uploadMixOfImages(fields);
// };

// const multer = require('multer');
// const { put } = require('@vercel/blob');
// const sharp = require('sharp');
// const ApiError = require('../utils/apiError');

// // Configure Multer with safety limits
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png'];
//     allowedTypes.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new ApiError('Invalid file type (JPEG/PNG only)', 400), false);
//   },
// });

// const processAndUploadImage = async (file, folder = 'users') => {
//   try {
//     // Validate file existence
//     if (!file?.buffer) throw new Error('No file data received');

//     // Process image
//     const processedBuffer = await sharp(file.buffer)
//       .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
//       .toFormat('jpeg', { quality: 80 })
//       .toBuffer();

//     // Upload to blob storage
//     return await put(
//       `${folder}/${Date.now()}-${file.originalname}`,
//       processedBuffer,
//       { access: 'public' }
//     ).then((res) => res.url);
//   } catch (error) {
//     throw new ApiError(`Image processing failed: ${error.message}`, 400);
//   }
// };

// // Enhanced upload handler with required fields check
// exports.uploadMixOfImages = (arrayOfFields) => {
//   return async (req, res, next) => {
//     upload.fields(arrayOfFields)(req, res, async (err) => {
//       try {
//         // Error handling pipeline
//         if (err) throw new ApiError(err.message, 400);
//         if (!req.files) throw new ApiError('No files uploaded', 400);

//         // Process expected fields
//         await Promise.all(
//           arrayOfFields.map(async (field) => {
//             const files = req.files[field.name];

//             if (field.required && (!files || files.length === 0)) {
//               throw new ApiError(`${field.name} is required`, 400);
//             }

//             if (files) {
//               req.body[field.name] = await processAndUploadImage(files[0]);
//             }
//           })
//         );

//         next();
//       } catch (error) {
//         next(error);
//       }
//     });
//   };
// };

// // Field Configuration (router.js)
// exports.uploadUserImages = (options = { required: true }) =>
//   exports.uploadMixOfImages([
//     { name: 'personalPhoto', maxCount: 1, required: options.required },
//     { name: 'idPhoto', maxCount: 1, required: options.required },
//     { name: 'businessCardPhoto', maxCount: 1, required: false },
//   ]);

// const multer = require('multer');
// const { put } = require('@vercel/blob');
// const sharp = require('sharp');
// const ApiError = require('./utils/apiError'); // افترض أن لديك كلاس لإدارة الأخطاء

// // 1. تهيئة Multer للتعامل مع الملفات في الذاكرة
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB كحد أقصى
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png'];
//     allowedTypes.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new ApiError('يُسمح فقط بملفات JPEG أو PNG', 400), false);
//   },
// });

// // 2. دالة معالجة الصور
// const processImage = async (file) => {
//   try {
//     return await sharp(file.buffer)
//       .resize(800, 600, { fit: 'inside' })
//       .jpeg({ quality: 80 })
//       .toBuffer();
//   } catch (error) {
//     throw new ApiError('فشل في معالجة الصورة', 500);
//   }
// };

// // 3. دالة الرفع إلى Vercel Blob
// const uploadToBlob = async (buffer, filename, folder = 'nurses') => {
//   try {
//     const { url } = await put(`${folder}/${Date.now()}-${filename}`, buffer, {
//       access: 'public',
//     });
//     return url;
//   } catch (error) {
//     throw new ApiError('فشل في رفع الملف إلى التخزين', 500);
//   }
// };

// // 4. Middleware للحقول الثلاثة
// exports.uploadNursePhotos = upload.fields([
//   { name: 'personalPhoto', maxCount: 1 }, // صورة شخصية
//   { name: 'idPhoto', maxCount: 1 }, // صورة الهوية
//   { name: 'businessCardPhoto', maxCount: 1 }, // صورة البطاقة
// ]);

// // 5. معالجة الصور بعد الرفع
// exports.handlePhotoProcessing = async (req, res, next) => {
//   try {
//     // التأكد من وجود الملفات
//     if (!req.files) {
//       throw new ApiError('لم يتم رفع أي ملفات', 400);
//     }

//     // معالجة كل حقل
//     const fields = ['personalPhoto', 'idPhoto', 'businessCardPhoto'];
//     for (const field of fields) {
//       if (req.files[field]) {
//         const file = req.files[field][0];
//         const processedBuffer = await processImage(file);
//         req.body[field] = await uploadToBlob(
//           processedBuffer,
//           file.originalname
//         );
//       }
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

const multer = require('multer');
const { put } = require('@vercel/blob');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

// Multer configuration (keep your existing pattern)
const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only images are allowed', 400), false);
    }
  };

  return multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};

// Modified upload middleware for 3 specific fields
exports.uploadUserImages = multerOptions().fields([
  { name: 'idPhoto', maxCount: 1 },
  { name: 'businessCardPhoto', maxCount: 1 },
  { name: 'personalPhoto', maxCount: 1 },
]);

// New processing middleware for Vercel Blob
exports.processAndUpload = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  // Process all three fields in parallel
  await Promise.all(
    ['idPhoto', 'businessCardPhoto', 'personalPhoto'].map(async (field) => {
      if (req.files[field]) {
        const file = req.files[field][0];

        // Process image with Sharp
        const processedBuffer = await sharp(file.buffer)
          .resize(800, 800, { fit: 'inside' })
          .jpeg({ quality: 90 })
          .toBuffer();

        // Upload to Vercel Blob
        const { url } = await put(
          `users/${field}-${Date.now()}-${file.originalname}`,
          processedBuffer,
          { access: 'public' }
        );

        // Save URL to request body
        req.body[field] = url;
      }
    })
  );

  next();
});
