import { check } from 'express-validator'

export const creatUserValidator = [
  check('first_name')
    .notEmpty()
    .withMessage('First name required.')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.'),

  check('last_name')
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long.'),

  check('email')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a vaild email address.'),

  check('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, 'i')
    .withMessage(
      'Password should be combination of one uppercase , one lower case, one special char,one digit and min 8'
    ),
  check('address')
    .isLength({ min: 3 })
    .notEmpty()
    .withMessage('Address must be at least 3 characters'),

  check('phone')
    .notEmpty()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),

    check('age')
    .notEmpty()
    .withMessage('Age is required')
    .isInt({min:0})
    .withMessage('Age must be a non-negative integer'),

    check('city')
    .notEmpty()
    .withMessage('Please select a city name'),


    check('country')
    .notEmpty()
    .withMessage('Please select a country name'),
]

export const updateUserValidator = [
  check('first_name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.'),
  check('last_name')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.'),
]
export const forgetPasswordValidator = [
  check('email')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a vaild email address.'),
]