const express = require('express');
const router = express.Router();

const {
  uploadUserImages,
  processAndUpload,
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
router.get('/getMe', getLoggedUserData, getUserbyId);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateUserLoggedValidator, updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUserData);

// Nurse routes - placed before parameterized routes
router.get(
  '/nurses',
  // authService.allowedTo('patient', 'admin', 'nurse'),
  getAllNurses
);

router.get('/nurses/:id', getNurseById);

router.get(
  '/department/:departmentId',
  // authService.allowedTo('patient', 'admin', 'nurse'),
  getNursesByDepartment
);

// Admin-only routes
// router.use(authService.allowedTo('admin'));

router
  .route('/')
  .get(getUsers)
  .post(uploadUserImages, processAndUpload, createUserValidator, createUser);

router
  .route('/:id')
  .get(getUserValidator, getUserbyId)
  .put(updateUserValidator, updateUserById)
  .delete(deleteUserValidator, deleteUserById);

module.exports = router;
