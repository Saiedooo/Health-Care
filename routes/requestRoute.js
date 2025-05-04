const express = require('express');
const router = express.Router();
const authService = require('../services/authServices');
const {
  createRequest,
  updateRequestStatus,
  getRequestsForNurse,
  getAllRequests,
  deleteRequest,
  recievedRequests,
  requestAction,
  sentNotifi,
} = require('../services/requestServices');

router.use(authService.protect);

router.get('/sent', sentNotifi);
// GET /api/v1/request/received
router.get('/received', recievedRequests);

// PATCH /api/v1/request/:id/accept or /reject
router.put('/:id/:action', requestAction);

// Protect all routes

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
