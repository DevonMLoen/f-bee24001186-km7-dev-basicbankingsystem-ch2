const joi = require('joi');

const userSchema = joi.object({
  userName: joi.string()
    .required()
    .messages({
      'string.base': 'User name must be a string.',
      'any.required': 'User name is required.'
    }),

  userEmail: joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'User email must be a string.',
      'string.email': 'User email must be a valid email address.',
      'any.required': 'User email is required.'
    }),

  userPassword: joi.string()
    .min(10)
    .required()
    .messages({
      'string.base': 'User password must be a string.',
      'string.min': 'User password must have at least 10 characters.',
      'any.required': 'User password is required.'
    }),

  profileType: joi.string()
    .required()
    .messages({
      'string.base': 'Profile type must be a string.',
      'any.required': 'Profile type is required.'
    }),

  profileNumber: joi.string()
    .required()
    .messages({
      'string.base': 'Profile number must be a string.',
      'any.required': 'Profile number is required.'
    }),

  address: joi.string()
    .required()
    .messages({
      'string.base': 'Address must be a string.',
      'any.required': 'Address is required.'
    })
});


const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const bankAccountSchema = joi.object({
  userId: joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number.',
      'number.integer': 'User ID must be an integer.',
      'number.positive': 'User ID must be a positive number.',
      'any.required': 'User ID is required.',
    }),

  bankName: joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Bank name must be a string.',
      'string.min': 'Bank name must have at least 3 characters.',
      'string.max': 'Bank name must have at most 100 characters.',
      'any.required': 'Bank name is required.',
    }),

  bankAccountNumber: joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.base': 'Bank account number must be a string.',
      'string.min': 'Bank account number must have at least 6 characters.',
      'string.max': 'Bank account number must have at most 20 characters.',
      'any.required': 'Bank account number is required.',
    }),

  balance: joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Balance must be a number.',
      'number.min': 'Balance must be at least 0.',
      'any.required': 'Balance is required.',
    }),
});

const bankAccountPatchSchema = joi.object({
  bankName: joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Bank name must be a string.',
      'string.min': 'Bank name must have at least 3 characters.',
      'string.max': 'Bank name must have at most 100 characters.',
      'any.required': 'Bank name is required.',
    }),

  bankAccountNumber: joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.base': 'Bank account number must be a string.',
      'string.min': 'Bank account number must have at least 6 characters.',
      'string.max': 'Bank account number must have at most 20 characters.',
      'any.required': 'Bank account number is required.',
    }),

  balance: joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Balance must be a number.',
      'number.min': 'Balance must be at least 0.',
      'any.required': 'Balance is required.',
    }),
});

const transactionSchema = joi.object({
  sourceAccountId: joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Source account ID must be a number.',
      'number.integer': 'Source account ID must be an integer.',
      'number.positive': 'Source account ID must be a positive number.',
      'any.required': 'Source account ID is required.',
    }),

  destinationAccountId: joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Destination account ID must be a number.',
      'number.integer': 'Destination account ID must be an integer.',
      'number.positive': 'Destination account ID must be a positive number.',
      'any.required': 'Destination account ID is required.',
    }),

  amount: joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Amount must be a number.',
      'number.positive': 'Amount must be a positive number.',
      'any.required': 'Amount is required.',
    }),
});

const resetPasswordSchema = joi.object({
  newPassword: joi.string()
    .min(10)
    .required()
    .messages({
      'string.base': 'New password must be a string.',
      'string.min': 'New password must have at least 10 characters.',
      'any.required': 'New password is required.'
    }),
});

const loginSchema = joi.object({
  email: joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email must be a string.',
      'string.email': 'Email must be a valid email address.',
      'any.required': 'Email is required.'
    }),

  password: joi.string()
    .required()
    .messages({
      'string.base': 'Password must be a string.',
      'any.required': 'Password is required.'
    }),
});



const validateBankAccount = (req, res, next) => {
  const { error } = bankAccountSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateBankPatchAccount = (req, res, next) => {
  const { error } = bankAccountPatchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateTransaction = (req, res, next) => {
  const { error} = transactionSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};


module.exports = { validateUser, validateBankAccount, validateTransaction, validateBankPatchAccount, validateLogin, validateResetPassword };