// Its always a good idea to have an dictionary of `Error Code - Description` pairs for evey project.
export const GENERIC_ERR_STR = `Something went wrong! Please try again.`;
export const INVALID_MOBILE_STR = `Please enter a valid mobile-number!`;
export const ERROR_CODES = {
  // if property `userMessage` is not specified it will default to GENERIC_ERR_STR
  // USER:
  INVALID_MOBILE: {
    status: 422,
    message: `Invalid mobile number`,
    userMessage: INVALID_MOBILE_STR
  },
  BLACKLISTED_USER: {
    status: 403,
    message: `User BLACKLISTED`,
    userMessage: INVALID_MOBILE_STR
  },
  INCORRECT_PASSWORD: {
    status: 422,
    message: `Incorrect password`,
    userMessage: `Please re-check your mobile-number/password!`
  },
  INCORRECT_OTP: {
    status: 422,
    message: `Incorrect OTP`,
    userMessage: `Please re-check your mobile-number/OTP!`
  },

  // Login
  ERR_LOGINFORM: {
    status: 500,
    message: `Login form could not be loaded`,
    userMessage: INVALID_MOBILE_STR
  },

  // DB
  ERR_DB_CONNECTION: {
    status: 500,
    message: `Couldn't establish a connection with the database instance.`,
    userMessage: GENERIC_ERR_STR
  },
  DB_INSTANCE_NOT_FOUND: {
    status: 500,
    message: `Database instance not found`,
    userMessage: GENERIC_ERR_STR
  }
};
