const express = require('express');

const router = express.Router();

const {
  createSpecialities,
  uploadSpecialitiesImage,
  resizeImage,
  getSpecialitiesById,
  GetAllSpecialities,
  updateSpecialitiesById,
  deleteSpecialitiesById,
} = require('../services/specialtiesServices');

const authService = require('../services/authServices');

router.use(authService.protect);

router.use(authService.allowedTo('admin'));
router
  .route('/')
  .get(GetAllSpecialities)
  .post(uploadSpecialitiesImage, resizeImage, createSpecialities);

router
  .route('/:id')
  .get(getSpecialitiesById)
  .put(uploadSpecialitiesImage, resizeImage, updateSpecialitiesById)
  .delete(deleteSpecialitiesById);

module.exports = router;
