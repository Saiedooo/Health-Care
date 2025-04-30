const express = require('express');
const router = express.Router();

const {
  uploadUserImages,
  processAndUpload,
  uploadSingleImage,
  processImage,
} = require('../middleware/uploadImageMiddleware');

const {
  createUser,
  getUserbyId,
  getUsers,
  updateUserById,
  deleteUserById,
  getLoggedUserData,
  updateLoggedUserData,
  updateLoggedUserPassword,
  deleteLoggedUserData,
  getNursesByDepartment,
  getAllNurses,
  getNurseById,
} = require('../services/userServices');

const {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserValidator,
  updateUserLoggedValidator,
} = require('../utils/validators/userValidator');

const authService = require('../services/authServices');

// Apply protection to all routes
// router.use(authService.protect);

// User profile routes
router.get('/getMe', getLoggedUserData);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put(
  '/updateMe',
  uploadSingleImage('personalPhoto'),
  processImage,
  updateUserLoggedValidator,
  updateLoggedUserData
);
router.delete('/deleteMe', deleteLoggedUserData);

// Nurse routes
router.get('/nurses', getAllNurses);
router.get('/nurses/:id', getNurseById);
router.get('/specialty/:specialtyId', getNursesByDepartment);

// Admin-only routes
// router.use(authService.allowedTo('admin'));

router
  .route('/')
  .get(getUsers)
  .post(uploadUserImages, processAndUpload, createUserValidator, createUser);

router
  .route('/:id')
  .get(getUserValidator, getUserbyId)
  .put(
    uploadSingleImage('personalPhoto'),
    processImage,
    updateUserValidator,
    updateUserById
  )
  .delete(deleteUserValidator, deleteUserById);

module.exports = router;
