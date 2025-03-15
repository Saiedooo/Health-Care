const express = require('express');
const router = express.Router();
const authService = require('../services/authServices');
const {
  createRequest,
  updateRequestStatus,
  getRequestsForNurse,
  getAllRequests,
  deleteRequest,
} = require('../services/requestServices');

// Protect all routes
router.use(authService.protect);

// Routes for users (patients)
router.use(authService.allowedTo('user', 'admin'));
router.route('/').post(createRequest);

// Routes for admins
router.use(authService.allowedTo('admin'));
router.route('/').get(getAllRequests);

// Routes for nurses
router.use(authService.allowedTo('nurse', 'admin'));
router.route('/:requestId').put(updateRequestStatus);
router.route('/:requestId').delete(deleteRequest);
router.route('/nurse/:nurseid').get(getRequestsForNurse);

module.exports = router;
