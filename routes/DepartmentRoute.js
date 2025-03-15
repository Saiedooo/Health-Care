const express = require('express');

const router = express.Router();

const {
  createDepartment,
  uploadDepartmentImage,
  resizeImage,
  deleteDepartmentById,
  updateDepartmentById,
  getDepartmentById,
  getDepartments,
} = require('../services/departmentServices');

const authService = require('../services/authServices');

router.use(authService.protect);

router.use(authService.allowedTo('admin'));
router
  .route('/')
  .get(getDepartments)
  .post(uploadDepartmentImage, resizeImage, createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(uploadDepartmentImage, resizeImage, updateDepartmentById)
  .delete(deleteDepartmentById);

module.exports = router;
