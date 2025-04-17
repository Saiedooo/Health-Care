const express = require('express');

const router = express.Router();

const {
  uploadUserImages,
  processAndUpload,
} = require('../middleware/uploadImageMiddleware');

const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const {
  // signup,
  nurseSignup,
  patientSignup,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
  resizeImage,
  uploadUserImage,
} = require('../services/authServices');

// router.post('/signup', signupValidator, signup); //+ validator
// router.post(
//   '/patientSignup',
//   uploadUserImage,
//   resizeImage,
//   signupValidator,
//   patientSignup
// ); //+ validator

// uploadUserImages(),
// resizeImage,
router.post(
  '/patientSignup',
  uploadUserImages,
  processAndUpload,
  signupValidator,
  patientSignup
); //+ validator
// router.post(
//   '/nurseSignup',
//   uploadUserImage,
//   resizeImage,
//   signupValidator,
//   nurseSignup
// ); //+ validator

// uploadUserImages(),
// resizeImage,
router.post(
  '/nurseSignup',
  uploadUserImages,
  processAndUpload,
  signupValidator,
  nurseSignup
);

router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPasswordResetCode);
router.put('/resetPassword', resetPassword);

module.exports = router;
