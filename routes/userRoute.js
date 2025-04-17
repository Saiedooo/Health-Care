const express = require('express');

const router = express.Router();

const {
  uploadUserImages,
  processAndUpload,
} = require('../middleware/uploadImageMiddleware');

const {
  createUser,
  uploadUserImage,
  resizeImage,
  getUserbyId,
  getUsers,
  updateUserById,
  deleteUserById,
  getLoggedUserData,
  updateLoggedUserData,
  updateLoggedUserPassword,
  deleteLoggedUserData,
} = require('../services/userServices');

const {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserValidator,

  updateUserLoggedValidator,
} = require('../utils/validators/userValidator');

const authService = require('../services/authServices');

router.use(authService.protect);

router.get('/getMe', getLoggedUserData, updateUserById);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put(
  '/updateMe',
  getLoggedUserData,
  updateUserLoggedValidator,
  updateLoggedUserData
);
router.delete('/deleteMe', deleteLoggedUserData);

router.use(authService.allowedTo('admin'));
router.route('/').get(getUsers).post(
  // uploadUserImages(), resizeImage,
  uploadUserImages,
  processAndUpload,
  createUserValidator,
  createUser
);
// .post(uploadUserImage, resizeImage, createUserValidator, createUser);

router
  .route('/:id')
  .get(
    getUserValidator,
    getUserbyId,
    // .put(uploadUserImage, resizeImage
    updateUserValidator,
    updateUserById
  )
  .put(
    // uploadUserImages(), resizeImage,
    updateUserValidator,
    updateUserById
  )
  .delete(deleteUserValidator, deleteUserById);

module.exports = router;
