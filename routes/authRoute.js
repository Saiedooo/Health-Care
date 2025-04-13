const express = require('express');

const router = express.Router();

const { uploadUserImages } = require('../middleware/uploadImageMiddleware');

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
router.post(
  '/patientSignup',
  uploadUserImages(),
  resizeImage,
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

router.post(
  '/nurseSignup',
  uploadUserImages(),
  resizeImage,
  signupValidator,
  nurseSignup
);

router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPasswordResetCode);
router.put('/resetPassword', resetPassword);

module.exports = router;
