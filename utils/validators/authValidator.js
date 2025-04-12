const { check, body } = require('express-validator');
const validatorMIddleware = require('../../middleware/validatorMiddleware');

const User = require('../../models/userModel');

exports.signupValidator = [
  check('firstName')
    .notEmpty()
    .withMessage('Must be Write your Firstname')
    .isLength({ min: 3 })
    .withMessage('too short'),
  check('lastName')
    .notEmpty()
    .withMessage('Must be Write your LastName')
    .isLength({ min: 3 })
    .withMessage('too short'),
  check('email')
    .notEmpty()
    .withMessage('Email Is required')
    .isEmail()
    .withMessage('invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail is already used'));
        }
      })
    ),
  check('address').notEmpty().withMessage('Address is Required'),
  check('password')
    .notEmpty()
    .withMessage('password Required')
    .isLength({ min: 6 })
    .withMessage('password must be at 6 charecters')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('password Confimation InCorrect');
      }
      return true;
    }),

  check('passwordConfirm').notEmpty().withMessage('password Confirm Required'),

  check('phoneNumber')
    .notEmpty()
    .isMobilePhone(['ar-EG'])
    .withMessage('invalid phone number only accepted egy number'),

  check('personalPhoto').notEmpty().withMessage('Personal photo is Required '),
  check('role').optional(),

  validatorMIddleware,
];

exports.loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('invalid email adress'),

  check('password')
    .notEmpty()
    .withMessage('password Required')
    .isLength({ min: 6 })
    .withMessage('password must be at 6 charecters'),

  validatorMIddleware,
];
