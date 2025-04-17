const express = require('express');
const { uploadUserImages } = require('../middleware/uploadImageMiddleware');

const router = express.Router();

const {
  createDepartment,
  resizeImage,
  deleteDepartmentById,
  updateDepartmentById,
  getDepartmentById,
  getDepartments,
} = require('../services/departmentServices');

const authService = require('../services/authServices');

router.use(authService.protect);

router.use(authService.allowedTo('admin'));
router.route('/').get(getDepartments).post(
  // uploadUserImages(), resizeImage,
  createDepartment
);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(
    // uploadUserImages(), resizeImage,
    updateDepartmentById
  )
  .delete(deleteDepartmentById);

module.exports = router;
