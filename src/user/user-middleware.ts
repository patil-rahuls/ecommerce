import { Request, Response, NextFunction } from 'express';
import { DB } from '../middlewares/db.js';
import { BaseError } from '../middlewares/error-middleware.js';
import { AuthMiddleware } from './user-auth-middleware.js';
import { InputValidator } from '../common/input-validator.js';

class UserMiddleware {
  public async profile(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.session?.user?.isAuthenticated) {
        const dbConn = await DB.createConnection(res);
        const userAddresses = await this.getUserAddresses(dbConn, req.session.user.id);
        DB.releaseConnection(res);
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
          const dbConn = await DB.createConnection(res);
          const result = await this.updateUser(dbConn, dataTobeUpdated, req.session.user.id);
          DB.releaseConnection(res);
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
            throw new BaseError(`ERR_PROFILE_UPDATE_FAILED`);
            // res.json({
            //   status: 500,
            //   userMessage: `Something went wrong!`
            // });
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
      const validationErrors: any = {};
      if (req.session?.user?.isAuthenticated) {
        let { addrName = '', addrLine1 = '', addrLine2 = '' } = req.body;
        const { addrMobile = '', addrPincode = '', addrType = '', id = '', ct = '' } = req.body;
        if (!AuthMiddleware.isRequestAuthorized(req, ct)) {
          throw new BaseError('ERR_UNAUTHORIZED_PROFILE_EDIT_ATTEMPT');
        }
        const dataTobeUpdated: any = {};
        // Input Validations
        addrName = addrName.trim();
        if (addrName && InputValidator.validateName(addrName)) {
          dataTobeUpdated.name = addrName;
        } else {
          validationErrors.addrNameErr = 'Invalid Name';
        }
        if (addrMobile && InputValidator.validateMobileNumber(addrMobile)) {
          dataTobeUpdated.mobile = addrMobile;
        } else {
          validationErrors.addrMobileErr = 'Invalid Mobile Number';
        }
        if (addrPincode && InputValidator.validatePincode(addrPincode)) {
          dataTobeUpdated.pincode = addrPincode;
        } else {
          validationErrors.addrPincodeErr = 'Invalid Pincode';
        }
        if (addrType && InputValidator.validateAddrType(addrType)) {
          dataTobeUpdated.addressType = addrType;
        } else {
          validationErrors.addrTypeErr = 'Please select address type';
        }
        [addrLine1, addrLine2] = [addrLine1, addrLine2].map(addTxt => addTxt.trim());
        dataTobeUpdated.addressText = '';
        [addrLine1, addrLine2].forEach((addrTxt, i) => {
          if (addrTxt && InputValidator.validateAddress(addrTxt)) {
            // dataTobeUpdated[`addrLine${i}`] = addrTxt;
            dataTobeUpdated.addressText += addrTxt + ' ';
          } else {
            validationErrors[`addrLine${i}Err`] = 'Invalid address text';
          }
        });
        if (Object.keys(validationErrors).length) {
          res.json({
            status: 422,
            validationErrors
          });
        } else if (Object.keys(dataTobeUpdated).length === 5) {
          dataTobeUpdated.addressText = dataTobeUpdated.addressText.trim();
          const dbConn = await DB.createConnection(res);
          if (id) {
            // Update
            const result = await this.updateUserAddress(dbConn, dataTobeUpdated, req.session?.user?.id, id);
            DB.releaseConnection(res);
            if (!result?.affectedRows) {
              throw new BaseError(`ERR_ADDR_UPDATE_FAILED`);
              // res.json({
              //   status: 500,
              //   userMessage: `Something went wrong!`
              // });
            }
            // Update session.
            const i = req.session.user.allAddresses.findIndex(addr => addr.id === Number(id));
            Object.entries(dataTobeUpdated).forEach(([k, v]) => {
              req.session.user.allAddresses[i][k] = v;
            });
            res.json({
              status: 200,
              userMessage: `Address Updated!`
            });
          } else {
            // Add
            dataTobeUpdated['user_id'] = req.session?.user?.id;
            const result = await this.insertUserAddress(dbConn, dataTobeUpdated);
            DB.releaseConnection(res);
            if (!result?.insertId) {
              throw new BaseError(`ERR_COULDNT_SAVE_USER`);
            }
            // delete dataTobeUpdated['user_id'];
            // Update session
            req.session.user.allAddresses.push(dataTobeUpdated);
            res.json({
              status: 201,
              userMessage: `Address Saved!`
            });
          }
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

  public async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.session?.user?.isAuthenticated) {
        const { id = '', ct = '' } = req.body;
        if (!AuthMiddleware.isRequestAuthorized(req, ct)) {
          throw new BaseError('ERR_UNAUTHORIZED_PROFILE_EDIT_ATTEMPT');
        }
        if (!id || isNaN(id)) {
          throw new BaseError(`ERR_ADDRESS_DELETE_FAILED`);
        }
        // Delete
        const dbConn = await DB.createConnection(res);
        const result = await this.deleteUserAddress(dbConn, req.session.user.id, id);
        DB.releaseConnection(res);
        if (result?.affectedRows) {
          // Update session.
          const i = req.session.user.allAddresses.findIndex(addr => addr.id === Number(id));
          req.session.user.allAddresses.splice(i, 1);
          res.json({
            status: 200,
            userMessage: `Address Removed!`
          });
        } else {
          throw new BaseError(`ERR_ADDRESS_DELETE_FAILED`);
          // res.json({
          //   status: 500,
          //   userMessage: `Something went wrong!`
          // });
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

  public async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.session?.user?.isAuthenticated) {
        const { id = '', ct = '' } = req.body;
        if (!AuthMiddleware.isRequestAuthorized(req, ct)) {
          throw new BaseError('ERR_UNAUTHORIZED_PROFILE_EDIT_ATTEMPT');
        }
        if (!id || isNaN(id)) {
          throw new BaseError(`ERR_ADDR_UPDATE_FAILED`);
        }
        // Update user - Set Default Address
        const dbConn = await DB.createConnection(res);
        const result = await this.setUserDefaultAddress(dbConn, req.session.user.id, id);
        DB.releaseConnection(res);
        if (result?.affectedRows) {
          // update session
          req.session.user.defaultBillingAddress = Number(id);
          req.session.user.defaultShippingAddress = Number(id);
          res.json({
            status: 200,
            userMessage: `Updated Successfully!`
          });
        } else {
          throw new BaseError(`ERR_ADDR_UPDATE_FAILED`);
          // res.json({
          //   status: 500,
          //   userMessage: `Something went wrong!`
          // });
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

  public async wishlist(req: Request, res: Response, next: NextFunction) {
    try {
      // Only for UI dev...
      res.render('index', {
        layout: 'user-wishlist',
        data: null
      });
      /*
      if (req.session?.user?.isAuthenticated) {
        const dbConn = await DB.createConnection(res);
        const userWishlist = await this.getUserWishlist(dbConn, req.session.user.id);
        DB.releaseConnection(res);
        req.session.user.wishlist = userWishlist;
        res.render('index', {
          layout: 'user-wishlist',
          data: req.session.user
        });
      } else {
        res.redirect('index');
      }
      // */
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_PROFILE_PAGE`, error.message));
      }
    }
  }

  private async getUserAddresses(dbConn, userId) {
    try {
      const [rows] = await dbConn.execute('SELECT id, name, mobile, pincode, address_text AS addressText, address_type AS addressType FROM `address` WHERE `user_id` = ?;', [userId]);
      // rows -> [{...}] OR []
      return rows;
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private async getUserWishlist(dbConn, userId) {
    try {
      const [rows] = await dbConn.execute('SELECT id, product_id FROM `wishlist` WHERE `user_id` = ?;', [userId]);
      // rows -> [{...}] OR []
      return rows;
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private async updateUser(dbConn, updateObj, userId) {
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
        // eslint-disable-next-line
        return result as any;
      } else {
        return false;
      }
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private async updateUserAddress(dbConn, updateObj, userId, addrId) {
    try {
      let updateStr = ``;
      const queryParams = [];
      for (const [field, val] of Object.entries(updateObj)) {
        queryParams.push(val);
        if (field === 'addressText') {
          updateStr += `address_text = ?,`;
        } else if (field === 'addressType') {
          updateStr += `address_type = ?,`;
        } else {
          updateStr += `${field} = ?,`;
        }
      }
      updateStr = updateStr?.slice(0, -1); // remove the last ','
      if (updateStr) {
        const [result] = await dbConn.execute(`UPDATE address SET ${updateStr} WHERE id = ? AND user_id = ?;`, [...queryParams, addrId, userId]);
        // eslint-disable-next-line
        return result as any;
      } else {
        return false;
      }
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private async insertUserAddress(dbConn, updateObj) {
    try {
      const queryParams = [];
      let fields = '';
      for (const [field, val] of Object.entries(updateObj)) {
        if (field === 'addressText') {
          updateObj['address_text'] = val;
          delete updateObj[field];
          queryParams.push(val);
          fields += `address_text ,`;
          continue;
        } else if (field === 'addressType') {
          updateObj['address_type'] = val;
          delete updateObj[field];
          queryParams.push(val);
          fields += `address_type ,`;
          continue;
        }
        queryParams.push(val);
        fields += `${field} ,`;
      }
      fields = fields.slice(0, -1); // remove the last ','
      const placeholders = '?,'.repeat(Object.keys(updateObj).length).slice(0, -1); // remove the last ','
      if (fields) {
        const stmt = `INSERT INTO address (${fields}) VALUES (${placeholders}) ;`;
        const [result] = await dbConn.execute(stmt, queryParams);
        // eslint-disable-next-line
        return result as any;
      } else {
        return false;
      }
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private async deleteUserAddress(dbConn, userId, addrId) {
    try {
      // first check if its not the default address
      const [chk] = await dbConn.execute(`SELECT id FROM user WHERE default_billing_addr = ? OR default_shipping_addr = ? `, [addrId, addrId]);
      if (chk?.[0]?.id) {
        // address is used as default shipping/billing.
        throw new BaseError(`ADDRESS_IN_USE_CANT_DELETE`);
      }
      const stmt = `DELETE FROM address WHERE user_id = ? AND id = ? ;`;
      const [result] = await dbConn.execute(stmt, [userId, addrId]);
      // eslint-disable-next-line
      return result as any;
    } catch (err) {
      if (err instanceof BaseError) {
        throw err;
      } else {
        throw new BaseError(`DB_QUERY_ERR`, err.message);
      }
    }
  }

  private async setUserDefaultAddress(dbConn, userId, addrId) {
    try {
      // chk if address id exists in address table.
      const [chk] = await dbConn.execute(`SELECT id FROM address WHERE id = ? `, [addrId]);
      if (!chk?.[0]?.id) {
        // address id doesn't exist in address table. Cant set as default.
        throw new BaseError(`ADDRESS_NOT_EXISTS_CANT_SET_DEFAULT`);
      }
      const stmt = `UPDATE user SET default_shipping_addr = ?, default_billing_addr = ? WHERE id = ? ;`;
      const [result] = await dbConn.execute(stmt, [addrId, addrId, userId]);
      // eslint-disable-next-line
      return result as any;
    } catch (err) {
      if (err instanceof BaseError) {
        throw err;
      } else {
        throw new BaseError(`DB_QUERY_ERR`, err.message);
      }
    }
  }
}

export { UserMiddleware };
