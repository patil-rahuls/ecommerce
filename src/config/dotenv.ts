// Make sure you have an environment variables file in the root directory (outside the 'src' directory).
// The file name should be => .development.env
// process.env.NODE_ENV = 'development'; // development, production. This should get set by the npm command. check package.json
import dotenv from 'dotenv';
// import path from 'path';
dotenv.config({ path: `.${process.env.NODE_ENV}.env` });
// dotenv.config({ path: path.join(__dirname,  `../../.${process.env.NODE_ENV}.env` )});
