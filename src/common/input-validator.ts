abstract class InputValidator {
  public static readonly validateMobileNumber = mobileNum => {
    const regxPattern = new RegExp(/^[6-9]\d{9}$/);
    return mobileNum?.length === 10 && !isNaN(mobileNum) && regxPattern.test(mobileNum);
  };
}

export { InputValidator };
