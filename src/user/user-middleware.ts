import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../middlewares/error-middleware.js';
import { AuthMiddleware } from './user-auth-middleware.js';
import { InputValidator } from '../common/input-validator.js';
import { LOGGER } from '../common/logger.js';

class UserMiddleware {
  public async profile(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.session?.user?.isAuthenticated) {
        const dbInstance = Object.keys(res.locals.DB)?.find(k => res.locals.DB[k] !== null);
        if (!dbInstance) {
          throw new BaseError('DB_INSTANCE_NOT_FOUND');
        }
        res.locals.DB_CONN[dbInstance] = await res.locals.DB[dbInstance].getConnection();
        const dbConn = res.locals.DB_CONN[dbInstance];
        const userAddresses = await this.getUserAddresses(req.session.user.id, dbConn);
        await dbConn.release(); // res.locals.DB_CONN[dbInstance].release();
        LOGGER.info(`DB connection ${dbInstance} Released!`);
        req.session.user.allAddresses = userAddresses;
        res.render('index', {
          layout: 'user-profile',
          data: req.session.user
        });
      } else {
        res.redirect('index');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_PROFILE_PAGE`, error.message));
      }
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validationErrors: any = {};
      if (req.session?.user?.isAuthenticated) {
        const { name = '', email = '', gender = '', password = '', repassword = '', ct = '' } = req.body;
        if (!AuthMiddleware.isRequestAuthorized(req, ct)) {
          throw new BaseError('ERR_UNAUTHORIZED_PROFILE_EDIT_ATTEMPT');
        }
        const dataTobeUpdated: any = {};
        // Input Validations.
        if (name) {
          if (name !== req.session.user.name) {
            if (InputValidator.validateName(name)) {
              dataTobeUpdated.name = name;
            } else {
              // throw new BaseError(`INVALID_NAME`);
              validationErrors.nameErr = 'Invalid Name';
            }
          }
        } else if (!name && req.session.user.name) {
          validationErrors.nameErr = 'Please enter Name';
        }
        if (email) {
          if (email !== req.session.user.email) {
            if (InputValidator.validateEmail(email)) {
              dataTobeUpdated.email = email;
            } else {
              // throw new BaseError(`INVALID_EMAIL`);
              validationErrors.emailErr = 'Invalid Email ID';
            }
          }
        } else if (!email && req.session.user.email) {
          validationErrors.emailErr = 'Please enter an Email';
        }
        if (gender) {
          if (gender !== req.session.user.gender) {
            if (InputValidator.validateGender(gender)) {
              dataTobeUpdated.gender = gender;
            } else {
              // throw new BaseError(`INVALID_GENDER`);
              validationErrors.genderErr = 'Please select a Gender';
            }
          }
        } else if (!gender && req.session.user.gender) {
          validationErrors.genderErr = 'Please select a Gender';
        }
        if (password) {
          // if(!await bcrypt.compare(password, req.session.user.password)){
          if (password !== req.session.user.password) {
            if (!InputValidator.validatePassword(password)) {
              // throw new BaseError(`INVALID_PASSWORD`);
              validationErrors.profilePasswordErr = 'Please try another one';
            } else if (password !== repassword) {
              // throw new BaseError(`CONFIRM_PASSWORD_ERR`);
              validationErrors.profileRePasswordErr = "Passwords didn't match";
            } else {
              dataTobeUpdated.password = password;
            }
          }
        }
        if (Object.keys(validationErrors).length) {
          res.json({
            status: 422,
            validationErrors
          });
        } else if (Object.keys(dataTobeUpdated).length) {
          // Update
          const dbInstance = Object.keys(res.locals.DB)?.find(k => res.locals.DB[k] !== null);
          if (!dbInstance) {
            throw new BaseError('DB_INSTANCE_NOT_FOUND');
          }
          res.locals.DB_CONN[dbInstance] = await res.locals.DB[dbInstance].getConnection();
          const dbConn = res.locals.DB_CONN[dbInstance];
          const result = await this.updateUser(req.session.user.id, dbConn, dataTobeUpdated);
          await dbConn.release(); // res.locals.DB_CONN[dbInstance].release();
          LOGGER.info(`DB connection ${dbInstance} Released!`);
          if (result?.affectedRows) {
            // Update session.
            Object.entries(dataTobeUpdated).forEach(([k, v]) => {
              req.session.user[k] = v;
            });
            res.json({
              status: 200,
              userMessage: `Updated Successfully!`
            });
          } else {
            res.json({
              status: 500,
              userMessage: `Something went wrong!`
            });
          }
        } else {
          res.json({
            status: 304,
            userMessage: `No change detected.`
          });
        }
      } else {
        res.redirect('index');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_PROFILE_PAGE`, error.message));
      }
    }
  }

  public async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.session?.user?.isAuthenticated) {
        const {
          addrName = '',
          addrMobile = '',
          addrLine1 = '',
          addrLine2 = '',
          addrPincode = '',
          addrType = '',
          id = '',
          ct = ''
        } = req.body;
        if (!AuthMiddleware.isRequestAuthorized(req, ct)) {
          throw new BaseError('ERR_UNAUTHORIZED_PROFILE_EDIT_ATTEMPT');
        }
        if (id) {
          // Update
        } else {
          // Add
        }
        res.json({
          status: 200,
          userMessage: `Yo Yo`
        });
      } else {
        res.redirect('index');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_PROFILE_PAGE`, error.message));
      }
    }
  }

  private async getUserAddresses(userId, dbConn) {
    try {
      const [rows] = await dbConn.execute(
        'SELECT id, name, mobile, pincode, address_text AS addressText, address_type AS addressType FROM `address` WHERE `user_id` = ?;',
        [userId]
      );
      // rows -> [{...}] OR []
      return rows;
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private async updateUser(userId, dbConn, updateObj) {
    try {
      let updateStr = ``;
      const queryParams = [];
      for (const [field, val] of Object.entries(updateObj)) {
        // if(field === 'password'){
        // const salt = await bcrypt.genSaltSync(10);
        // val = await bcrypt.hash(val, salt);
        // }
        updateStr += `${field} = ?,`;
        queryParams.push(val);
      }
      updateStr = updateStr?.slice(0, -1); // remove the last ','
      if (updateStr) {
        const [result] = await dbConn.execute(`UPDATE user SET ${updateStr} WHERE id = ?;`, [...queryParams, userId]);
        return result as any;
      } else {
        return false;
      }
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }
}

export { UserMiddleware };
