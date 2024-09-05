// Its always a good idea to have an dictionary of `Error Code - Description` pairs for evey project.
export const GENERIC_ERR_STR = `Something went wrong! Please try again`;
export const INVALID_MOBILE_STR = `Please enter a valid mobile-number!`;
export const ERROR_CODES = {
  // if property `userMessage` is not specified it will default to GENERIC_ERR_STR
  ERR_RESOURCE_ATTEMPT_UNAUTHORIZED: {
    status: 401,
    message: `Resource attempted without preSessionId.`
  },
  ERR_INVALID_CSRF_TOKEN: {
    status: 401,
    message: `Resource attempted without OR incorrect CSRF token.`,
    userMessage: `Oops. Please try again!`
  },

  // Validations
  ERR_INVALID_MOBILE: {
    status: 422,
    message: `Invalid mobile number`,
    userMessage: INVALID_MOBILE_STR
  },
  ERR_INVALID_NAME: {
    status: 422,
    message: `Invalid characters in name`,
    userMessage: `Please enter a valid Name`
  },
  ERR_INVALID_EMAIL: {
    status: 422,
    message: `Invalid email`,
    userMessage: `Please enter a valid Email ID`
  },
  ERR_INVALID_GENDER: {
    status: 422,
    message: `Invalid gender`,
    userMessage: `Please select a valid Gender`
  },
  ERR_INVALID_PASSWORD: {
    status: 422,
    message: `Invalid password`,
    userMessage: `Password must be at least 6 digits`
  },
  ERR_INVALID_CONFIRM_PASSWORD: {
    status: 422,
    message: `Password re-entered was incorrect/invalid/non-matching`,
    userMessage: `Please re-enter the password correctly`
  },

  // USER
  ERR_USER_BLACKLISTED: {
    status: 403,
    message: `User Login- User BLACKLISTED!`
  },
  ERR_USER_INCORRECT_PASSWORD: {
    status: 422,
    message: `User Login- Incorrect password!`,
    userMessage: `Password is incorrect!`
  },
  ERR_USER_INCORRECT_OTP: {
    status: 422,
    message: `User Login- Incorrect OTP!`,
    userMessage: `OTP is incorrect!`
  },
  ERR_USER_COULDNT_SAVE: {
    status: 500,
    message: `User- Couldn't insert user into db!`
  },
  ERR_USER_OTP_REQUESTED_TOO_SOON: {
    status: 422,
    message: `User OTP- Re-requested too soon by the user!`
  },
  ERR_USER_OTP_COULDNT_SAVE: {
    status: 500,
    message: `User OTP- Couldn't save user OTP to redis!`
  },
  ERR_USER_LOGOUT: {
    status: 500,
    message: `User Logout- Failed!`,
    userMessage: `Please try again!`
  },

  // USER Login
  ERR_USER_LOGINFORM: {
    status: 500,
    message: `User Login- form could not be loaded!`
  },
  ERR_USER_LOGINFORM_UNAUTHORIZED: {
    status: 401,
    message: `User Login- Login form attempted without authorization/preSessionId!`
  },
  ERR_USER_LOGIN_ATTEMPT_UNAUTHORIZED: {
    status: 401,
    message: `User Login- attempted without preSessionId OR expired/missing CSRF token!`
  },
  ERR_USER_OTP_COULDNT_SEND: {
    status: 500,
    message: `User Login- Couldn't send OTP!`
  },
  ERR_USER_LOGIN: {
    status: 500,
    message: `User Login- request could not be completed!`
  },
  ERR_USER_NOT_AUTHENTICATED: {
    status: 401,
    message: `User Login- Authentication required!`,
    userMessage: `Please log-in first!`
  },
  ERR_USR_ALREADY_LOGGED_IN: {
    status: 400,
    message: `User Login- Already logged in!`
  },

  // USER - Profile
  ERR_USER_PROFILE_PAGE: {
    status: 500,
    message: `User Profile- Failed in Profile page!`
  },
  ERR_USER_PROFILE_UPDATE_FAILED: {
    status: 500,
    message: `User Profile- Couldn't save/update Profile!`,
    userMessage: `Something went wrong!`
  },
  ERR_USER_PROFILE_UNAUTHORIZED_EDIT_ATTEMPT: {
    status: 401,
    message: `User Profile- Edit attempted without preSessionId OR expired/missing CSRF token!`,
    userMessage: `Please try again!`
  },

  // USER - Address
  ERR_USER_ADDRESS_UPDATE_FAILED: {
    status: 500,
    message: `User Address- Couldn't save/update User Address!`,
    userMessage: `Something went wrong!`
  },
  ERR_USER_ADDRESS_IN_USE_CANT_DELETE: {
    status: 400,
    message: `User Address- Couldn't Delete User address because it is a Default Shipping/Billing Address!`,
    userMessage: `Can't remove default address!`
  },
  ERR_USER_ADDRESS_DELETE_FAILED: {
    status: 500,
    message: `User Address- Couldn't Delete User address!`,
    userMessage: `Something went wrong!`
  },
  ERR_USER_ADDRESS_NOT_EXISTS_CANT_SET_DEFAULT: {
    status: 500,
    message: `User Address- Doesn't exists. Couldn't set as default!`,
    userMessage: `Something went wrong!`
  },

  // USER - Wishlist
  ERR_USER_WISHLIST_PAGE: {
    status: 500,
    message: `User Wishlist- Failed in Profile page!`
  },
  ERR_USER_WISHLIST_UPDATE_FAILED: {
    status: 500,
    message: `User Wishlist- Couldn't update User Wishlist!`
  },
  ERR_USER_WISHLIST_UNAUTHORIZED_UPDATE_ATTEMPT: {
    status: 400,
    message: `User Wishlist- Update attempted without preSessionId OR expired/missing CSRF token!`
  },
  ERR_PRODUCT_WISHLIST_DATA: {
    status: 500,
    message: `User Wishlist- Couldn't retrieve Wishlist Products from Redis!`
  },

  // USER - Cart
  ERR_USER_CART_PAGE: {
    status: 500,
    message: `User Cart- Failed in cart page!`
  },

  // WIP Products
  ERR_ORDERS_PAGE: {
    status: 500,
    message: `User Orders- Failed in Orders page!`
  },

  // WIP PRODUCT
  ERR_PRODUCT_PAGE: {
    status: 500,
    message: `Product- Failed in Product page!`
  },
  ERR_GET_PRODUCT_REDIS: {
    status: 500,
    message: `Product- Couldn't get Product from Redis!`
  },
  ERR_SET_PRODUCT_REDIS: {
    status: 500,
    message: `Product- Failed to Set Product into Redis!`
  },
  ERR_GET_PRODUCT_REDIS_BY_ATTRIBUTES: {
    status: 500,
    message: `Product- Failed to get Product by Attributes from Redis!`
  },

  // DB - MySQL
  ERR_DB_CONNECTION: {
    status: 503,
    message: `Database- Couldn't establish connection with the Database Instance!`
  },
  ERR_DB_INSTANCE_NOT_FOUND: {
    status: 501,
    message: `Database- Instance not found!`
  },
  ERR_DB_STMT: {
    status: 500,
    message: `Database- Query/Stmt failed!`
  },

  // DB - Redis
  ERR_REDIS_CONNECTION: {
    status: 503,
    message: `REDIS- Couldn't establish a connection with the redis instance!`
  },
  ERR_REDIS_CONN_ATTEMPTS_EXCEEDED: {
    status: 503,
    message: `REDIS- Too many attempts to reconnect. Connection was terminated!`
  },
  ERR_REDIS_CMD: {
    status: 500,
    message: `REDIS- Command failed!`
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
