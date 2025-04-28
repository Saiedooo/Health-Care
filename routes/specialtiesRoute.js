const express = require('express');
const {
  uploadUserImages,
  processAndUpload,
} = require('../middleware/uploadImageMiddleware');

const router = express.Router();

const {
  createSpecialities,

  getSpecialitiesById,
  GetAllSpecialities,
  updateSpecialitiesById,
  deleteSpecialitiesById,
} = require('../services/specialtiesServices');

const authService = require('../services/authServices');

// router.use(authService.protect);

// router.use(authService.allowedTo('admin'));
router
  .route('/')
  .get(GetAllSpecialities)
  .post(uploadUserImages, processAndUpload, createSpecialities);

router
  .route('/:id')
  .get(getSpecialitiesById)
  .put(uploadUserImages, processAndUpload, updateSpecialitiesById)
  .delete(deleteSpecialitiesById);

module.exports = router;
