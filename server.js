const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const dbConnection = require('./config/database');
const app = express();

const globalError = require('./middleware/errorMiddleware');

const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const adminActivateRoute = require('./routes/adminActivateRoute');

dotenv.config({ path: '.env' });

//middlewares
app.use(express.json());

// Development Mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

//routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/activation', adminActivateRoute);

// Db connection
dbConnection();

// global Error
app.use(globalError);

const PORT = 4000 || process.env.PORT;

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
