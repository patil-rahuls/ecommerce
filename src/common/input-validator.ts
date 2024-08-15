import { GENDER_ARR, ADDRESS_TYPE_ARR } from './types.js';

abstract class InputValidator {
  public static readonly validateMobileNumber = mobileNum => {
    const regxPattern = new RegExp(/^[6-9]\d{9}$/);
    return mobileNum?.length === 10 && !isNaN(mobileNum) && regxPattern.test(mobileNum);
  };

  public static readonly validateName = name => {
    const regxPattern = new RegExp(/^[A-z ]+$/);
    return name?.length <= 70 && regxPattern.test(name);
  };

  public static readonly validateEmail = email => {
    const regxPattern = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return email?.length <= 254 && regxPattern.test(email);
  };

  public static readonly validateGender = gender => {
    return GENDER_ARR.some(gen => gen === gender);
  };

  public static readonly validateAddrType = addr => {
    return ADDRESS_TYPE_ARR.some(addrType => addrType === addr);
  };

  public static readonly validatePassword = pw => {
    const regxPattern = new RegExp(/^[A-Za-z0-9_!@#$^./&+-]*$/);
    return pw?.length >= 6 && regxPattern.test(pw);
  };

  public static readonly validatePincode = pc => {
    const regxPattern = new RegExp(/^(\d{6})?$/);
    return pc?.length === 6 && regxPattern.test(pc);
  };

  public static readonly validateAddress = addr => {
    const regxPattern = new RegExp(/^[A-Za-z0-9 .\(.*\)\/@#&,-]*$/);
    return addr && regxPattern.test(addr);
  };
}

export { InputValidator };
