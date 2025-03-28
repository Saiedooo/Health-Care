const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const dbConnection = require('./config/database');
const app = express();

const globalError = require('./middleware/errorMiddleware');

const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const adminActivateRoute = require('./routes/adminActivateRoute');
const departmentRoute = require('./routes/DepartmentRoute');
const specialtiesRoute = require('./routes/specialtiesRoute');
const requestRoute = require('./routes/requestRoute');

dotenv.config({ path: '.env' });

//middlewares
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5122/', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (cookies, tokens)
  })
);

app.options('*', cors()); // Handle preflight requests for all routes

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

// Db connection
dbConnection();

// global Error
app.use(globalError);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}....`);
});

// handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.log(`unhandledRejection Errors ${err.name} |  ${err.message}`);
  server.close(() => {
    console.log('Shutting Down.......');
    process.exit(1);
  });
});
