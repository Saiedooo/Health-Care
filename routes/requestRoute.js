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

// Routes for patients (create request)
router
  .route('/')
  .post(authService.allowedTo('patient', 'admin'), createRequest)
  .get(authService.allowedTo('admin', 'nurse'), getAllRequests);

// Routes for nurses and admins
router.use(authService.allowedTo('nurse', 'admin'));
router.route('/:requestId').put(updateRequestStatus).delete(deleteRequest);

router.route('/nurse/:nurseid').get(getRequestsForNurse);

module.exports = router;
