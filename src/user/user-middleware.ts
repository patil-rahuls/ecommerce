import { Request, Response, NextFunction } from 'express';
import { DB } from '../middlewares/db.js';
import { BaseError } from '../middlewares/error-middleware.js';
import { InputValidator } from '../common/input-validator.js';
import { REDIS_INSTANCE } from '../common/redis.js';
import { ProductMiddleware } from '../product/product-middleware.js';

const product = new ProductMiddleware();
class UserMiddleware {
  // Profile Page
  public async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const dbConn = await DB.createConnection(res);
      const userAddresses = await this.getUserAddresses(dbConn, req.session.user.id);
      DB.releaseConnection(res);
      req.session.user.allAddresses = userAddresses;
      res.render('index', {
        layout: 'user-profile',
        data: req.session.user
      });
    } catch (error) {
      res.locals.noRedirect = true; // This will prevent the error page and instead redirect back to original page.
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_PROFILE_PAGE`, error.message));
      }
    }
  }

  // Edit Profile Details
  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validationErrors: any = {};
      const { name = '', email = '', gender = '', password = '', repassword = '' } = req.body;
      const dataTobeUpdated: any = {};
      // Input Validations.
      if (name) {
        if (name !== req.session.user.name) {
          if (InputValidator.validateName(name)) {
            dataTobeUpdated.name = name;
          } else {
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
            validationErrors.profilePasswordErr = 'Please try another one';
          } else if (password !== repassword) {
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
          throw new BaseError(`ERR_USER_PROFILE_UPDATE_FAILED`);
        }
      } else {
        res.json({
          status: 304,
          userMessage: `Looks Good!`
        });
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_PROFILE_PAGE`, error.message));
      }
    }
  }

  // Edit Address
  public async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const validationErrors: any = {};
      let { addrName = '', addrLine1 = '', addrLine2 = '' } = req.body;
      const { addrMobile = '', addrPincode = '', addrType = '', id = '' } = req.body;
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
          dataTobeUpdated.addressText += addrTxt + ' <ADDR_LINE_SEPARATOR>';
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
        const pos = dataTobeUpdated.addressText.lastIndexOf('<ADDR_LINE_SEPARATOR>');
        dataTobeUpdated.addressText = dataTobeUpdated.addressText.slice(0, pos).trim();
        // dataTobeUpdated.addressText string will contain a token <ADDR_LINE_SEPARATOR> and will be stored in db as is.
        const dbConn = await DB.createConnection(res);
        if (id) {
          // Update
          const result = await this.updateUserAddress(dbConn, dataTobeUpdated, req.session?.user?.id, id);
          DB.releaseConnection(res);
          if (!result?.affectedRows) {
            throw new BaseError(`ERR_USER_ADDRESS_UPDATE_FAILED`);
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
            throw new BaseError(`ERR_USER_COULDNT_SAVE`);
          }
          // delete dataTobeUpdated['user_id'];
          // Update session
          dataTobeUpdated['id'] = result.insertId;
          req.session.user.allAddresses.push(dataTobeUpdated);
          res.json({
            status: 201,
            userMessage: `Address Saved!`,
            addrId: result.insertId
          });
        }
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_PROFILE_PAGE`, error.message));
      }
    }
  }

  // Delete Address
  public async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id = '' } = req.body;
      if (!id || isNaN(id)) {
        throw new BaseError(`ERR_USER_ADDRESS_DELETE_FAILED`);
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
        throw new BaseError(`ERR_USER_ADDRESS_DELETE_FAILED`);
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_PROFILE_PAGE`, error.message));
      }
    }
  }

  // Set Address as Default
  public async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id = '' } = req.body;
      if (!id || isNaN(id)) {
        throw new BaseError(`ERR_USER_ADDRESS_UPDATE_FAILED`);
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
        throw new BaseError(`ERR_USER_ADDRESS_UPDATE_FAILED`);
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_PROFILE_PAGE`, error.message));
      }
    }
  }

  // Get Wishlist
  public async wishlist(req: Request, res: Response, next: NextFunction) {
    try {
      req.session.user.wishlist = await this.getUserWishlist(req.session.user.id);
      res.render('index', {
        layout: 'user-wishlist',
        data: req.session.user
      });
    } catch (error) {
      res.locals.noRedirect = true;
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_WISHLIST_PAGE`, error.message));
      }
    }
  }

  // Add/Remove Wishlist Products
  public async updateWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId = '' } = req.body;
      switch (req.method) {
        case 'DELETE':
          await this.editUserWishlist(req.session.user.id, productId, false);
          break;
        case 'POST':
          await this.editUserWishlist(req.session.user.id, productId);
          break;
      }
      // TODO: Send Updated User Wishlist to Queue to update MySQL DB.
      res.json({
        status: 200,
        userMessage: `Wishlist Updated!`
      });
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_WISHLIST_PAGE`, error.message));
      }
    }
  }

  // Get Cart
  public async cart(req: Request, res: Response, next: NextFunction) {
    try {
      req.session.user.cart = await this.getUserCart(req.session.user.id);
      res.render('index', {
        layout: 'user-cart',
        data: req.session.user
      });
    } catch (error) {
      res.locals.noRedirect = true;
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_CART_PAGE`, error.message));
      }
    }
  }

  // Add/Remove Cart Products
  public async updateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId = '' } = req.body;
      let result;
      switch (req.method) {
        case 'DELETE':
          // Delete all qty from cart
          result = await this.editUserCart(req.session.user.id, productId, true);
          break;
        case 'PUT':
          // Decrement the Qty
          // If quantity(after decrementing) is less than moq, then delete it. Else decrement it.
          const cartInfoInSession = req.session.user.cart.filter(itm => Number(itm.productId) === Number(productId))[0];
          if (Number(cartInfoInSession.qty) - 1 < Number(cartInfoInSession.detail.moq)) {
            // delete
            result = await this.editUserCart(req.session.user.id, productId, true);
          } else {
            result = await this.editUserCart(req.session.user.id, productId, false, false);
          }
          break;
        case 'POST':
          // Add to cart/Increment Qty
          result = await this.editUserCart(req.session.user.id, productId);
          break;
      }
      // Get updated cart.
      req.session.user.cart = await this.getUserCart(req.session.user.id);
      const shipping = req.session.user.cart?.reduce((acc, itm) => acc + Number(itm?.detail?.shipping) * Number(itm?.qty), 0);
      const orderTotal = req.session.user.cart?.reduce((acc, itm) => acc + Number(itm?.detail?.sellPrice) * Number(itm?.qty), 0);
      // TODO: Apply Shopping cart rule.
      // TODO: Send Updated User Cart to Queue to update MySQL DB.
      res.json({
        status: 200,
        userMessage: result || `Please Try Again!`,
        updatedCart: req.session.user.cart,
        orderTotal,
        shipping
      });
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_CART_PAGE`, error.message));
      }
    }
  }

  // WIP
  public async orders(req: Request, res: Response, next: NextFunction) {
    try {
      // const dbConn = await DB.createConnection(res);
      // const userOrders = await this.getUserOrders(dbConn, req.session.user.id);
      // DB.releaseConnection(res);
      // req.session.user.orders = userOrders;
      res.render('index', {
        layout: 'user-orders',
        data: req.session.user
      });
    } catch (error) {
      res.locals.noRedirect = true;
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_ORDERS_PAGE`, error.message));
      }
    }
  }

  // ## Queries / Private Methods ## //
  private async getUserAddresses(dbConn, userId) {
    try {
      const [rows] = await dbConn.execute('SELECT id, name, mobile, pincode, address_text AS addressText, address_type AS addressType FROM `address` WHERE `user_id` = ?;', [userId]);
      return rows;
    } catch (err) {
      throw new BaseError(`ERR_DB_STMT`, err.message);
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
      throw new BaseError(`ERR_DB_STMT`, err.message);
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
      throw new BaseError(`ERR_DB_STMT`, err.message);
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
      throw new BaseError(`ERR_DB_STMT`, err.message);
    }
  }

  private async deleteUserAddress(dbConn, userId, addrId) {
    try {
      // first check if its not the default address
      const [chk] = await dbConn.execute(`SELECT id FROM user WHERE default_billing_addr = ? OR default_shipping_addr = ? `, [addrId, addrId]);
      if (chk?.[0]?.id) {
        // address is used as default shipping/billing.
        throw new BaseError(`ERR_USER_ADDRESS_IN_USE_CANT_DELETE`);
      }
      const stmt = `DELETE FROM address WHERE user_id = ? AND id = ? ;`;
      const [result] = await dbConn.execute(stmt, [userId, addrId]);
      // eslint-disable-next-line
      return result as any;
    } catch (err) {
      if (err instanceof BaseError) {
        throw err;
      } else {
        throw new BaseError(`ERR_DB_STMT`, err.message);
      }
    }
  }

  private async setUserDefaultAddress(dbConn, userId, addrId) {
    try {
      // chk if address id exists in address table.
      const [chk] = await dbConn.execute(`SELECT id FROM address WHERE id = ? `, [addrId]);
      if (!chk?.[0]?.id) {
        // address id doesn't exist in address table. Cant set as default.
        throw new BaseError(`ERR_USER_ADDRESS_NOT_EXISTS_CANT_SET_DEFAULT`);
      }
      const stmt = `UPDATE user SET default_shipping_addr = ?, default_billing_addr = ? WHERE id = ? ;`;
      const [result] = await dbConn.execute(stmt, [addrId, addrId, userId]);
      // eslint-disable-next-line
      return result as any;
    } catch (err) {
      if (err instanceof BaseError) {
        throw err;
      } else {
        throw new BaseError(`ERR_DB_STMT`, err.message);
      }
    }
  }

  private async getUserWishlist(userId) {
    try {
      const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisRead.connect();
      // "USR:WISHLIST:<USER_ID>"= [pid1, pid2, pid3, ...]
      const productIds = await redisRead.sMembers(`USR:WISHLIST:${userId}`);
      // Prepare wishlist data from "PRODUCT:<PID>"
      const userWishlist = await Promise.all(
        productIds.map(async pid => {
          const productData = await product.getProductDetailsByAttributes(pid, ['id', 'imgThumbnail', 'title', 'rating', 'discountPercentage', 'mrp', 'sellPrice', 'url']);
          return {
            id: productData.id,
            img: productData.imgThumbnail,
            title: productData.title,
            rating: productData.rating || 0,
            discount: productData.discountPercentage && `${productData.discountPercentage}% Off`,
            mrp: productData.mrp && `₹ ${productData.mrp}`,
            sellPrice: productData.sellPrice && `₹ ${productData.sellPrice}`,
            url: productData.url && `${productData.url}`
          };
        })
      );
      await redisRead.quit();
      // Return filtered userWishlist with only those products whose all values are non null.
      return userWishlist.filter(itm => Object.values(itm).every(attrVal => attrVal));
    } catch (err) {
      throw new BaseError(`ERR_REDIS_CMD`, err.message);
    }
  }

  private async editUserWishlist(userId, productId, set = true) {
    try {
      let result;
      const redisWrite = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisWrite.connect();
      if (!set) {
        result = await redisWrite.sRem(`USR:WISHLIST:${userId}`, [productId]);
      } else {
        result = await redisWrite.sAdd(`USR:WISHLIST:${userId}`, productId);
      }
      await redisWrite.quit();
      return result;
    } catch (err) {
      if (err instanceof BaseError) {
        throw err;
      } else {
        throw new BaseError(`ERR_REDIS_CMD`, err.message);
      }
    }
  }

  private async getUserCart(userId) {
    try {
      const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisRead.connect();
      // "USR:CART:<USER_ID>"= {pid1: qty1, pid2: qty2, pid3: qty3, ...}
      const cartProducts = await redisRead.hGetAll(`USR:CART:${userId}`);
      // Prepare cart data from "PRODUCT:<PID>"
      const userCart = await Promise.all(
        Object.keys(cartProducts).map(async pid => {
          const productData = await product.getProductDetailsByAttributes(pid, ['id', 'imgThumbnail', 'title', 'discountPercentage', 'mrp', 'sellPrice', 'url', 'attributes', 'expectedDeliveryDate', 'moq', 'shippingCost']);
          return {
            productId: Number(productData.id),
            qty: Number(cartProducts[pid]),
            detail: {
              id: Number(productData.id),
              img: productData.imgThumbnail,
              title: productData.title,
              discount: productData.discountPercentage,
              mrp: productData.mrp,
              sellPrice: productData.sellPrice,
              url: productData.url,
              attributes: productData.attributes || '',
              moq: Number(productData.moq) || 1,
              expectedDeliveryDate: productData.expectedDeliveryDate,
              shipping: productData.shippingCost || process.env.DEFAULT_SHIPPING_COST
            }
          };
        })
      );
      await redisRead.quit();
      return userCart;
    } catch (err) {
      throw new BaseError(`ERR_REDIS_CMD`, err.message);
    }
  }

  private async editUserCart(userId, productId, del = false, set = true) {
    try {
      let result;
      const redisWrite = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisWrite.connect();
      if (del) {
        result = await redisWrite.hDel(`USR:CART:${userId}`, productId);
        if (Number(result) === 1) {
          result = 'Item Removed !';
        }
      } else {
        // del = false -> don't delete. Only add/increment/decrement based on 'set' parameter.
        if (set) {
          // Set product to cart OR Increment if exists.
          // "hIncrBy" creates a new field if it doesn't exists and performs the incr. opeation.
          result = await redisWrite.hIncrBy(`USR:CART:${userId}`, productId, 1);
          result = 'Quantity Updated !';
        } else {
          // decrement qty
          const productQty = await redisWrite.hGet(`USR:CART:${userId}`, productId);
          // if qty is greater than 1, decrement it.
          if (Number(productQty) > 1) {
            result = await redisWrite.hIncrBy(`USR:CART:${userId}`, productId, -1);
            result = 'Quantity Updated !';
          } else {
            // if qty becomes 0, remove the product from cart
            result = await redisWrite.hDel(`USR:CART:${userId}`, productId);
            if (Number(result) === 1) {
              result = 'Item Removed !';
            }
          }
        }
      }
      await redisWrite.quit();
      return result;
    } catch (err) {
      if (err instanceof BaseError) {
        throw err;
      } else {
        throw new BaseError(`ERR_REDIS_CMD`, err.message);
      }
    }
  }
}

export { UserMiddleware };
