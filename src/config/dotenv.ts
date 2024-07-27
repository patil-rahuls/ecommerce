process.env.NODE_ENV = 'development'; // production
import dotenv from 'dotenv';
// import path from 'path';
dotenv.config({ path: `.${process.env.NODE_ENV}.env` });
// dotenv.config({ path: path.join(__dirname,  `../../.${process.env.NODE_ENV}.env` )});
