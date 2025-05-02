const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Pass io to your routes if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

const router = express.Router();

const {
  getReviewById,
  getReviews,
  updateReviewById,
  deleteReviewById,
  createReview,
  getNurseReviews,
} = require('../services/reviewServices');
const {
  uploadUserImages,
  processAndUpload,
} = require('../middleware/uploadImageMiddleware');

const authService = require('../services/authServices');

// Apply protection to all routes
router.get('/nurse/:nurseId', getNurseReviews); // get
router.use(authService.protect);
router.use(authService.allowedTo('patient', 'admin'));

// Nurse-specific review routes
router.post('/nurse/:nurseId', createReview); //create

// General review routes
router
  .route('/')
  .get(getReviews)
  .post(uploadUserImages, processAndUpload, createReview);

router
  .route('/:id')
  .get(getReviewById)
  .put(updateReviewById)
  .delete(deleteReviewById);

// server.js
const notificationNamespace = io.of('/notifications');
const serviceNamespace = io.of('/services');

// --- Notification Namespace ---
notificationNamespace.on('connection', (socket) => {
  // Nurse joins their own room using their nurseId
  socket.on('join', (nurseId) => {
    socket.join(nurseId);
  });

  // Patient creates a request for a specific nurse
  socket.on('patient_request', ({ nurseId, patientInfo, requestDetails }) => {
    // Send notification only to the specific nurse
    notificationNamespace.to(nurseId).emit('new_request', {
      patientInfo,
      requestDetails,
    });
  });
});

// --- Service Namespace ---
serviceNamespace.on('connection', (socket) => {
  // Patient creates a request
  socket.on('create_request', (data) => {
    // Notify nurses (could be a room or broadcast)
    serviceNamespace.emit('new_service_request', data);
  });

  // Nurse responds to request
  socket.on('nurse_response', (data) => {
    // Notify the patient
    serviceNamespace.to(data.patientId).emit('service_response', data);
  });

  // Join a room for targeted service events
  socket.on('join', (room) => {
    socket.join(room);
  });
});

module.exports = router;
