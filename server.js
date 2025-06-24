const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const dbConnection = require('./config/database');

const http = require('http');
const WebSocket = require('ws');
const app = express();
const globalError = require('./middleware/errorMiddleware');

const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const adminActivateRoute = require('./routes/adminActivateRoute');
const departmentRoute = require('./routes/DepartmentRoute');
const specialtiesRoute = require('./routes/specialtiesRoute');
const requestRoute = require('./routes/requestRoute');
const reviewRoute = require('./routes/reviewRoute');
const notificationRoute = require('./routes/notificationRoute');
const { Server } = require('socket.io');

dotenv.config({ path: '.env' });

// Web Socket
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const wss = new WebSocket.Server({ server });

const activeNurses = new Map();

wss.on('connection', (ws, req) => {
  // استخراج nurseId من عنوان URL
  const nurseId = new URL(
    req.url,
    `http://${req.headers.host}`
  ).searchParams.get('nurseId');

  if (nurseId) {
    // تخزين اتصال الممرض
    activeNurses.set(nurseId, ws);
    console.log(`Nurse ${nurseId} connected`);

    // إزالة الاتصال عند الإغلاق
    ws.on('close', () => {
      activeNurses.delete(nurseId);
      console.log(`Nurse ${nurseId} disconnected`);
    });
  }
});

// --- Socket.IO Notifications ---
const notificationNamespace = io.of('/notifications');
notificationNamespace.on('connection', (socket) => {
  socket.on('join', (nurseId) => {
    socket.join(nurseId);
  });
  // You can add more events here as needed
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId); // user joins a room with their userId
  });
});

//middlewares
app.use(express.json());
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === 'development'
//         ? 'http://localhost:5122/'
//         : process.env.FRONTEND_URL ||
//           'https://your-vercel-frontend-url.vercel.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   })
// );

// app.options('*', cors()); // Handle preflight requests for all routes

app.use(cors());

// Development Mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

//routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/activation', adminActivateRoute);
app.use('/api/v1/department', departmentRoute);
app.use('/api/v1/specialties', specialtiesRoute);
app.use('/api/v1/request', requestRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1', notificationRoute);
// app.use('/api/v1/review', reviewRoute);

// Db connection
dbConnection();

// global Error
app.use(globalError);

const PORT = process.env.PORT || 4000;

app.locals.wss = wss;
app.locals.activeNurses = activeNurses;
server.listen(PORT, () => console.log('Server running on port 4000'));

// const server = app.listen(PORT, () => {
//   console.log(`Server is Running on ${PORT}....`);
// });

// handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.log(`unhandledRejection Errors ${err.name} |  ${err.message}`);
  server.close(() => {
    console.log('Shutting Down.......');
    process.exit(1);
  });
});
