const { check, body } = require('express-validator');
const validatorMIddleware = require('../../middleware/validatorMiddleware');

const bcrypt = require('bcryptjs');
const User = require('../../models/userModel');

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id'),
  validatorMIddleware,
];

exports.createUserValidator = [
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

  check('password')
    .notEmpty()
    .withMessage('password Required')
    .isLength({ min: 6 })
    .withMessage('password must be at 6 charecters')
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error('password Confimation InCorrect');
      }
      return true;
    }),

  check('confirmPassword').notEmpty().withMessage('password Confirm Required'),

  check('phoneNumber')
    .notEmpty()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('invalid phone number only accepted egy and saudi number'),

  check('personalPhoto').notEmpty().withMessage('Personal Image is Required '),
  check('role').optional(),

  validatorMIddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id'),
  body('firstName').optional(),

  check('email')
    .optional()
    .isEmail()
    .withMessage('invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail is already used'));
        }
      })
    ),

  check('phoneNumber')
    .optional()
    .isMobilePhone(['ar-EG'])
    .withMessage('invalid phone number only accepted egy number'),

  check('personalPhoto').optional(),
  check('role').optional(),

  // check('password').isLength({min:6}).withMessage('password must be over 6 charecter')
  validatorMIddleware,
];
exports.changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User id'),

  check('currentPassword')
    .notEmpty()
    .withMessage('current Password is required'),

  check('confirmPassword')
    .notEmpty()
    .withMessage('You Must Enter the password Confirm'),

  check('password')
    .notEmpty()
    .withMessage('You Must Enter New password')
    .custom(async (val, { req }) => {
      // verfiy current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error('there is no user for this id');
      }
      const isComparePassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isComparePassword) {
        throw new Error('Incorrect Current Password');
      }
      // verify confirmPassword
      if (val !== req.body.confirmPassword) {
        throw new Error('password Confimation InCorrect');
      }

      return true;
    }),
  validatorMIddleware,
];

exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id'),
  validatorMIddleware,
];

exports.updateUserLoggedValidator = [
  check('id').isMongoId().withMessage('Invalid User id'),
  body('firstName').optional(),
  check('email')
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('invalid email adress')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail is already used'));
        }
      })
    ),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG'])
    .withMessage('invalid phone number only accepted egy number'),
  validatorMIddleware,
];
