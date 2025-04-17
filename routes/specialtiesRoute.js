const express = require('express');
const { uploadUserImages } = require('../middleware/uploadImageMiddleware');

const router = express.Router();

const {
  createSpecialities,
  resizeImage,
  getSpecialitiesById,
  GetAllSpecialities,
  updateSpecialitiesById,
  deleteSpecialitiesById,
} = require('../services/specialtiesServices');

const authService = require('../services/authServices');

router.use(authService.protect);

router.use(authService.allowedTo('admin'));
router.route('/').get(GetAllSpecialities).post(
  // uploadUserImages({ required: false }), resizeImage,
  createSpecialities
);

router
  .route('/:id')
  .get(getSpecialitiesById)
  .put(
    // uploadUserImages({ required: false }),
    // resizeImage,
    updateSpecialitiesById
  )
  .delete(deleteSpecialitiesById);

module.exports = router;
