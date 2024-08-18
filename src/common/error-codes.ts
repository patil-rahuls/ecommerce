// Its always a good idea to have an dictionary of `Error Code - Description` pairs for evey project.
export const GENERIC_ERR_STR = `Something went wrong! Please try again`;
export const INVALID_MOBILE_STR = `Please enter a valid mobile-number!`;
export const ERROR_CODES = {
  // if property `userMessage` is not specified it will default to GENERIC_ERR_STR
  // USER:
  INVALID_MOBILE: {
    status: 422,
    message: `Invalid mobile number`,
    userMessage: INVALID_MOBILE_STR
  },
  INVALID_NAME: {
    status: 422,
    message: `Invalid characters in name`,
    userMessage: `Please enter a valid Name`
  },
  INVALID_EMAIL: {
    status: 422,
    message: `Invalid email`,
    userMessage: `Please enter a valid Email ID`
  },
  INVALID_GENDER: {
    status: 422,
    message: `Invalid gender`,
    userMessage: `Please select a valid Gender`
  },
  INVALID_PASSWORD: {
    // While setting a password.
    status: 422,
    message: `Invalid password`,
    userMessage: `Password must be at least 6 digits`
  },
  CONFIRM_PASSWORD_ERR: {
    status: 422,
    message: `Password re-entered was incorrect/invalid/non-matching`,
    userMessage: `Please re-enter the password correctly`
  },
  BLACKLISTED_USER: {
    status: 403,
    message: `User BLACKLISTED`
  },
  INCORRECT_PASSWORD: {
    status: 422,
    message: `Incorrect password`,
    userMessage: `Password is incorrect!`
  },
  INCORRECT_OTP: {
    status: 422,
    message: `Incorrect OTP`,
    userMessage: `OTP is incorrect!`
  },
  ERR_COULDNT_SAVE_USER: {
    status: 500,
    message: `Couldn't insert user into db`
  },
  ERR_OTP_REQUESTED_TOO_SOON: {
    status: 422,
    message: `OTP re-requested too soon by the user/application`
  },
  ERR_COULDNT_SAVE_OTP: {
    status: 500,
    message: `Couldn't save OTP to redis`
  },

  // Login
  ERR_LOGINFORM: {
    status: 500,
    message: `Login form could not be loaded`
  },
  ERR_LOGINFORM_UNAUTHORIZED: {
    status: 400,
    message: `Login form attempted without authorization/preSessionId`
  },
  ERR_UNAUTHORIZED_LOGIN_ATTEMPT: {
    status: 400,
    message: `Login/otp attempted without preSessionId OR expired/missing CSRF token`
  },
  ERR_COULDNT_SEND_OTP: {
    status: 500,
    message: `Couldn't send OTP. Code failure`
  },
  ERR_LOGIN: {
    status: 500,
    message: `Login request could not be completed`
  },
  ERR_NOT_AUTHENTICATED: {
    status: 401,
    message: `Authentication required`,
    userMessage: `Please log-in first!`
  },
  ERR_USR_ALREADY_LOGGED_IN: {
    status: 400,
    message: `User is already logged in`
  },
  ERR_PROFILE_PAGE: {
    status: 500,
    message: `Failed in Profile page`
  },
  ERR_PROFILE_UPDATE_FAILED: {
    status: 500,
    message: `Could not save/update Profile info`,
    userMessage: `Something went wrong!`
  },
  ERR_ADDR_UPDATE_FAILED: {
    status: 500,
    message: `Could not save/update user address`,
    userMessage: `Something went wrong!`
  },
  ERR_UNAUTHORIZED_PROFILE_EDIT_ATTEMPT: {
    status: 400,
    message: `Profile edit attempted without preSessionId OR expired/missing CSRF token`,
    userMessage: `Please try again!`
  },
  ADDRESS_IN_USE_CANT_DELETE: {
    status: 400,
    message: `Given address is a default shipping/billing address, hence can't be deleted`,
    userMessage: `Can't remove default address!`
  },
  ERR_ADDRESS_DELETE_FAILED: {
    status: 500,
    message: `Could not delete user address`,
    userMessage: `Something went wrong!`
  },
  ADDRESS_NOT_EXISTS_CANT_SET_DEFAULT: {
    status: 500,
    message: `Could not set address as default as the address doesn't exist.`,
    userMessage: `Something went wrong!`
  },
  ERR_WISHLIST_PAGE: {
    status: 500,
    message: `Failed in Profile page`
  },
  ERR_ORDERS_PAGE: {
    status: 500,
    message: `Failed in Orders page`
  },

  // DB
  ERR_DB_CONNECTION: {
    status: 503,
    message: `Couldn't establish a connection with the database instance`
  },
  DB_INSTANCE_NOT_FOUND: {
    status: 501,
    message: `Database instance not found`
  },
  DB_QUERY_ERR: {
    status: 500,
    message: `Database query failed`
  },
  ERR_REDIS_CONNECTION: {
    status: 503,
    message: `Couldn't establish a connection with the redis instance`
  },

  // Logout
  ERR_LOGOUT: {
    status: 500,
    message: `Failed to logout user`,
    userMessage: `Couldn't Logout. Please try again!`
  }
};

/*
Complete list of HTTP Status Codes

1xx Informational
100	Continue
101	Switching protocols
102	Processing
103	Early Hints

2xx Succesful
200	OK
201	Created
202	Accepted
203 	Non-Authoritative Information
204	No Content
205	Reset Content
206	Partial Content
207	Multi-Status
208	Already Reported
226	IM Used

3xx Redirection
300	Multiple Choices
301	Moved Permanently
302	Found (Previously "Moved Temporarily")
303	See Other
304	Not Modified
305	Use Proxy
306	Switch Proxy
307	Temporary Redirect
308	Permanent Redirect

4xx Client Error
400	Bad Request
401	Unauthorized
402	Payment Required
403	Forbidden
404	Not Found
405	Method Not Allowed
406	Not Acceptable
407	Proxy Authentication Required
408	Request Timeout
409	Conflict
410	Gone
411	Length Required
412	Precondition Failed
413	Payload Too Large
414	URI Too Long
415	Unsupported Media Type
416	Range Not Satisfiable
417	Expectation Failed
418	I'm a Teapot
421	Misdirected Request
422	Unprocessable Entity
423	Locked
424	Failed Dependency
425	Too Early
426	Upgrade Required
428	Precondition Required
429	Too Many Requests
431	Request Header Fields Too Large
451	Unavailable For Legal Reasons

5xx Server Error
500	Internal Server Error
501	Not Implemented
502	Bad Gateway
503	Service Unavailable
504	Gateway Timeout
505	HTTP Version Not Supported
506	Variant Also Negotiates
507	Insufficient Storage
508	Loop Detected
510	Not Extended
511	Network Authentication Required
*/
