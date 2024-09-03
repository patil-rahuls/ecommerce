// ################################################################################################################################
// ## Common ##
const GENERIC_ERR = `Oops... That's us!`;
const getCookie = cookieType => {
  if (cookieType.trim()) {
    const regxPattern = new RegExp(String.raw`${cookieType}=`);
    return document.cookie
      ?.split('; ')
      ?.filter(c => regxPattern.test(c))?.[0]
      ?.split('=')?.[1];
  }
};
const fetchData = async (url, method = 'GET', data = '', headers = '') => {
  try {
    const ct = getCookie('ct');
    const at = getCookie('at');
    const rt = getCookie('rt');
    const res = await fetch(url, {
      method,
      headers: headers
        ? headers
        : {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': ct,
            Authorization: at,
            'X-AUTH-TOKEN': rt,
            credentials: 'include'
          },
      ...(['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].some(m => m === method) && { body: JSON.stringify(data) })
    });
    return await res.json();
  } catch (err) {
    return {
      status: 500,
      userMessage: `Something went wrong!`
    };
  }
};
const refreshPage = (delay = 1000) => {
  if (delay) {
    setTimeout(() => {
      window.location.reload();
    }, delay);
  } else {
    window.location.reload();
  }
};
const toast = (str, extraClass = '', timeout = 3000) => {
  if (str) {
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast ' + extraClass;
    toastDiv.innerHTML = str;
    if (timeout) {
      setTimeout(function () {
        toastDiv.remove();
      }, timeout);
    }
    document.body.appendChild(toastDiv);
  }
};

// ## Input Validation ##
const validateName = name => {
  const regxPattern = new RegExp(/^[A-z ]+$/);
  return name?.length <= 70 && regxPattern.test(name);
};
const validateMobileNumber = mobileNum => {
  const regxPattern = new RegExp(/^[6-9]\d{9}$/);
  return mobileNum?.length === 10 && !isNaN(mobileNum) && regxPattern.test(mobileNum);
};
const validateEmail = email => {
  const regxPattern = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  return email?.length <= 254 && regxPattern.test(email);
};
const validateGender = gender => {
  return ['Male', 'Female'].some(gen => gen === gender);
};
const validatePassword = pw => {
  const regxPattern = new RegExp(/^[A-Za-z0-9_!@#$^./&+-]*$/);
  return pw?.length >= 6 && regxPattern.test(pw);
};
const validateAddress = addr => {
  const regxPattern = new RegExp(/^[A-Za-z0-9 .\(.*\)\/@#&,-]*$/);
  return addr && regxPattern.test(addr);
};
const validatePincode = pc => {
  const regxPattern = new RegExp(/^(\d{6})?$/);
  return pc?.length === 6 && regxPattern.test(pc);
};

const formatAmount = amount => {
  return amount?.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR'
  });
};
const getAmountFromString = strAmount => {
  if (strAmount && !strAmount.match(/[a-zA-Z]/)) {
    let numberValue = parseFloat(strAmount.replace(/[ ,₹()]/g, ''));
    const finalValue = numberValue && !isNaN(numberValue) ? numberValue.toFixed(2) : '0.00';
    return Number(finalValue);
  } else {
    return null;
  }
};

const hideElement = sel => {
  !sel?.classList.contains('hide') && sel.classList.add('hide');
};
const showElement = (sel, displayProp = '') => {
  sel?.classList.contains('hide') && sel.classList.remove('hide');
  if (displayProp) {
    sel.style.display = displayProp;
  }
};
const setBtnState = (btnSel, inrTxt, displayProp = '') => {
  btnSel.value = inrTxt || 'CONTINUE';
  if (!displayProp) {
    btnSel?.classList.contains('loading') && btnSel.classList.remove('loading');
    btnSel.style.backgroundColor = 'var(--primary-color)';
    return;
  }
  btnSel?.classList.add(displayProp);
};

// ################################################################################################################################
// ## Navbar/Hamburger ##
const toggleHamburger = () => {
  document.querySelector('#meta')?.classList.toggle('show-flex');
  document.querySelector('.menu')?.classList.toggle('show');
};
document.getElementById('hamburger')?.addEventListener('click', toggleHamburger);

// ################################################################################################################################
// ## Dropdown Menus ##
const dropdownBtn = document.querySelectorAll('.dropdown-btn');
const dropdown = document.querySelectorAll('.dropdown');
const setAriaExpandedFalse = () => {
  dropdownBtn?.forEach(btn => btn?.setAttribute('aria-expanded', 'false'));
};
const closeDropdownMenu = () => {
  dropdown?.forEach(drop => {
    drop?.classList.remove('active');
    drop?.addEventListener('click', e => e.stopPropagation());
  });
};
// hide/close drpdwn-menu when clicked on the document body
document.documentElement.addEventListener('click', () => {
  closeDropdownMenu();
  setAriaExpandedFalse();
});
// hide/close drpdwn-menu when dropdown lnks are clicked.
document.querySelectorAll('.dropdown a')?.forEach(link =>
  link?.addEventListener('click', () => {
    closeDropdownMenu();
    setAriaExpandedFalse();
    toggleHamburger();
  })
);
dropdownBtn.forEach(btn => {
  btn?.addEventListener('click', e => {
    const dropdownIndex = e.currentTarget.dataset.dropdown;
    const dropdownElement = document.getElementById(dropdownIndex);
    dropdownElement?.classList.toggle('active');
    dropdown?.forEach(drop => {
      if (drop?.id !== btn?.dataset['dropdown']) {
        drop?.classList.remove('active');
      }
    });
    e.stopPropagation();
    btn?.setAttribute('aria-expanded', btn?.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
  });
});
// hide/close drpdwn on escape key press
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDropdownMenu();
    setAriaExpandedFalse();
  }
});

// ################################################################################################################################
// ## Popup/Modals ##
const loading = document.querySelector(`#loading`);
const blurOverlay = document.querySelector(`#blurOverlay`);
const retryBtn = document.querySelector(`#loading input`);
// ## show loading on anchor clicks ##
const showLoading = () => {
  loading.querySelector('b').innerText = 'Catchy quote here';
  showElement(loading);
  showElement(blurOverlay);
};
document.querySelectorAll('a[href*="/"]')?.forEach(a => a?.addEventListener('click', showLoading));
const closePopup = popupSel => {
  hideElement(popupSel);
  hideElement(loading);
  hideElement(blurOverlay);
};
const toggleLoading = (show = false) => {
  if (show) {
    showElement(loading);
    showElement(blurOverlay);
  } else {
    hideElement(loading);
    hideElement(blurOverlay);
  }
};
const logoutBtn = document.querySelector(`a[href*="/user/logout"]`);
logoutBtn?.addEventListener('click', () => toggleLoading(true));

// ## Popup/Modals - LoginForm - Show/Close ##
const mainLoginBtn = document.querySelector(`#login`);
const loginForm = document.querySelector(`#loginForm`);
const closeLoginFormSel = document.querySelector(`.close-loginForm`);
const closeLoginForm = () => {
  closePopup(loginForm);
  toggleLoading(true);
  // Remove query parameters.
  window.history.replaceState(null, document.title, window.location.href.split('?')[0]);
  refreshPage(0); // This may affect UX.
};
closeLoginFormSel?.addEventListener('click', closeLoginForm);
retryBtn?.addEventListener('click', () => {
  loading.querySelector('b').innerText = `Please wait. This won't take long.`;
  hideElement(retryBtn);
  refreshPage(0);
});
mainLoginBtn?.addEventListener('click', async () => {
  toggleLoading(true);
  try {
    const resp = await fetchData('/user/login');
    if (resp.status === 200) {
      hideElement(loading);
      showElement(loginForm);
    } else {
      loading.querySelector('b').innerText = GENERIC_ERR;
      showElement(retryBtn);
    }
  } catch (err) {
    loading.querySelector('b').innerText = GENERIC_ERR;
    showElement(retryBtn);
  }
});

// ################################################################################################################################
// ## Popup/Modals - LoginForm - CTAs ##
const continueBtn = document.querySelector(`#login-btn`);
const setError = (sel, msg) => {
  showElement(sel);
  sel.innerText = msg;
};
const unSetError = sel => {
  hideElement(sel);
  sel.innerText = '';
};
const loginId = document.querySelector('#loginId');
const loginIdErr = document.querySelector('#loginIdErr');
const password = document.querySelector('#password');
const passwordErr = document.querySelector('#passwordErr');
const passwordDiv = document.querySelector('#passwordDiv');
const isUsingPWSel = document.querySelector(`#pwlogin`);
let isUsingPW, loginIdOk;
isUsingPWSel?.addEventListener('click', () => {
  if (isUsingPW) {
    isUsingPWSel.innerHTML = '<b>Login using Password?</b>';
    password?.setAttribute('placeholder', 'OTP');
    password.value = '';
    isUsingPW = false;
    unSetError(passwordErr);
  } else {
    isUsingPWSel.innerHTML = '<b>Login using OTP?</b>';
    password?.setAttribute('placeholder', 'Password');
    password.value = '';
    isUsingPW = true;
    unSetError(passwordErr);
  }
});
const loginErr = (sel, inputSel, errMsg = '') => {
  setError(sel, errMsg || `Couldn't sent OTP. Please try again!`);
  setBtnState(continueBtn, 'LOGIN');
  continueBtn.disabled = false;
  inputSel.disabled = false;
};
const login = async () => {
  unSetError(passwordErr);
  password.disabled = true;
  continueBtn.disabled = true;
  setBtnState(continueBtn, 'Logging in...', 'loading');
  try {
    const ct = getCookie('ct');
    const resp = await fetchData('/user/verify', 'POST', { userId: loginId.value, passkey: password.value, ct });
    switch (resp.status) {
      case 400:
      case 422:
      case 403:
        continueBtn.disabled = false;
        setBtnState(continueBtn, 'LOGIN');
        loginErr(passwordErr, password, resp.userMessage);
        break;
      case 200:
        hideElement(isUsingPWSel);
        closeLoginFormSel?.removeEventListener('click', closeLoginForm);
        closeLoginFormSel?.remove();
        toast(resp.userMessage, 'success', false);
        setBtnState(continueBtn, 'Just a sec...', 'success');
        // Redirect to index, if logging in from 404 page.
        if (window.location.href.includes('/404')) {
          let returnUrl = window.location.href.split('/');
          returnUrl?.pop();
          window.location.href = returnUrl.join('/');
        } else if (resp.redirectUrl) {
          // Check if any redirect link is set in the respose.
          window.location.href = resp.redirectUrl;
        } else {
          refreshPage(0);
        }
        break;
      default:
        continueBtn.disabled = false;
        setBtnState(continueBtn, 'LOGIN');
        // loginErr(passwordErr, password, resp.userMessage || 'Oops. something went wrong!');
        toast(resp.userMessage, 'error');
        break;
    }
  } catch (err) {
    continueBtn.disabled = false;
    setBtnState(continueBtn, 'LOGIN');
    // loginErr(passwordErr, password, 'Oops. something went wrong!');
    toast('Oops. something went wrong!', 'error');
  }
};
continueBtn?.addEventListener('click', async () => {
  if (loginId.value?.length !== 10 || isNaN(loginId.value) || !new RegExp(/^[6-9]\d{9}$/).test(loginId.value)) {
    setError(loginIdErr, 'Please enter a valid mobile-number!');
    return;
  } else if (loginIdOk && !passwordDiv?.classList.contains('hide')) {
    switch (true) {
      case isUsingPW:
        if (password?.value?.length > 5 && /^[A-Za-z0-9_!@#$^./&+-]*$/.test(password.value)) {
          await login();
        } else {
          setError(passwordErr, 'Password is incorrect!');
          return;
        }
        break;
      case !isUsingPW:
        if (password?.value.length === 4 && !isNaN(password.value)) {
          await login();
        } else {
          setError(passwordErr, 'OTP is incorrect!');
          return;
        }
        break;
      default:
        setError(passwordErr, 'OTP/password is incorrect!');
        break;
    }
  } else {
    // userId is correct
    loginIdOk = true;
    unSetError(loginIdErr);
    loginId.disabled = true;
    setBtnState(continueBtn, 'Sending OTP...', 'loading');
    continueBtn.disabled = true;
    try {
      const ct = getCookie('ct');
      const resp = await fetchData('/user/auth', 'POST', { userId: loginId.value, ct });
      setBtnState(continueBtn, 'LOGIN');
      switch (resp.status) {
        case 400:
        case 422:
        case 403:
          loginErr(loginIdErr, loginId, resp.userMessage);
          break;
        case 200:
          showElement(passwordDiv);
          showElement(isUsingPWSel);
          toast(resp.userMessage, 'success');
          break;
        default:
          loginErr(loginIdErr, loginId, resp.userMessage || '');
          break;
      }
    } catch (err) {
      loginErr(loginIdErr, loginId);
    } finally {
      continueBtn.disabled = false;
      setBtnState(continueBtn, 'CONTINUE');
    }
  }
});

// ################################################################################################################################
// ## User Profile ##
const rePwTr = document.querySelector('#re-password');
const changePwLink = document.querySelector(`#changePassword`);
const profilePassword = document.querySelector('input[name="password"]');
const profileRePassword = document.querySelector('input[name="repassword"]');
const profileName = document.querySelector(`input[name="name"]`);
const profileEmail = document.querySelector(`input[name="email"]`);
const profileGender = document.querySelector(`select[name="gender"]`);
// errors
const nameErr = document.querySelector(`#nameErr`);
const emailErr = document.querySelector(`#emailErr`);
const genderErr = document.querySelector(`#genderErr`);
const profilePasswordErr = document.querySelector(`#profilePasswordErr`);
const profileRePasswordErr = document.querySelector(`#profileRePasswordErr`);
const updateProfileBtn = document.querySelector('#update-profile');
changePwLink?.addEventListener('click', function () {
  hideElement(changePwLink);
  showElement(profilePassword);
  showElement(rePwTr);
});
const itemsToBeUpdated = {};
const resetProfileUpdateErrors = () => {
  [nameErr, emailErr, genderErr, profilePasswordErr, profileRePasswordErr].forEach(sel => {
    sel.querySelector('span').innerText = '';
    hideElement(sel);
    err = false;
  });
};
const showProfileUpdateErrors = (errSel, msg) => {
  showElement(errSel);
  errSel.querySelector('span').innerText = msg;
};
const disableProfileForm = disabledState => {
  [changePwLink, profilePassword, profileRePassword, profileName, profileEmail, profileGender, updateProfileBtn].forEach(el => el?.disabled == disabledState);
  if (disabledState) {
    showElement(loading);
    showElement(blurOverlay);
    return;
  }
  hideElement(loading);
  hideElement(blurOverlay);
};
const updateProfile = async () => {
  disableProfileForm(true);
  try {
    if (Object.keys(itemsToBeUpdated).length) {
      const ct = getCookie('ct');
      itemsToBeUpdated.ct = ct;
      const resp = await fetchData('/user/profile', 'POST', itemsToBeUpdated);
      Object.keys(itemsToBeUpdated).forEach(key => delete itemsToBeUpdated[key]);
      if (resp?.validationErrors) {
        Object.entries(resp.validationErrors).forEach(([sel, errMsg]) => {
          showProfileUpdateErrors(document.querySelector(`#${sel}`), errMsg);
        });
      }
      switch (resp?.status) {
        case 200:
        case 304:
          if (!resp.validationErrors) {
            toast(resp.userMessage, 'success');
          }
          break;
        default:
          if (!resp.validationErrors) {
            toast(resp.userMessage, 'error');
          }
          break;
      }
    }
  } catch (err) {
    toast('Something went wrong!', 'error');
  }
  disableProfileForm(false);
};
const validateProfileInfo = () => {
  let ok = true;
  resetProfileUpdateErrors();
  if (profileName.value) {
    if (validateName(profileName.value)) {
      itemsToBeUpdated.name = profileName.value;
    } else {
      showProfileUpdateErrors(nameErr, `Invalid Name`);
      ok = false;
    }
  }
  if (profileEmail.value) {
    if (validateEmail(profileEmail.value)) {
      itemsToBeUpdated.email = profileEmail.value;
    } else {
      showProfileUpdateErrors(emailErr, `Invalid Email ID`);
      ok = false;
    }
  }
  if (profileGender.value) {
    if (validateGender(profileGender.value)) {
      itemsToBeUpdated.gender = profileGender.value;
    } else {
      showProfileUpdateErrors(genderErr, `Please select a Gender`);
      ok = false;
    }
  }
  if (profilePassword.value) {
    if (validatePassword(profilePassword.value)) {
      if (profilePassword.value === profileRePassword.value) {
        itemsToBeUpdated.password = profilePassword.value;
        itemsToBeUpdated.repassword = profileRePassword.value;
      } else {
        showProfileUpdateErrors(profileRePasswordErr, `Passwords didn't match`);
        ok = false;
      }
    } else {
      showProfileUpdateErrors(profilePasswordErr, `Please try another one`);
      ok = false;
    }
  }
  return ok;
};
updateProfileBtn?.addEventListener('click', async () => {
  if (validateProfileInfo()) {
    await updateProfile();
  }
});

// ################################################################################################################################
// ## User Address ##
const allAddresses = document.getElementsByClassName('address');
const addAddrBtn = document.querySelector(`#add-address`);
const addrForm = document.querySelector(`.addressForm `);
const addrLine1 = document.querySelector(`input[name="addrLine1"]`);
const addrLine2 = document.querySelector(`input[name="addrLine2"]`);
const addrPincode = document.querySelector(`input[name="addrPincode"]`);
const addrMobile = document.querySelector(`input[name="addrMobile"]`);
const addrName = document.querySelector(`input[name="addrName"]`);
const addrType = document.querySelector(`input[name="addrType"]:checked`);
const addrId = document.querySelector(`input[name="addrId"]`);
// errors
const addrTypeErr = document.querySelector('#addrTypeErr');
const addrPincodeErr = document.querySelector('#addrPincodeErr');
const addrMobileErr = document.querySelector('#addrMobileErr');
const addrNameErr = document.querySelector('#addrNameErr');
const addrLine1Err = document.querySelector('#addrLine1Err');
const addrLine2Err = document.querySelector('#addrLine2Err');
const saveAddrBtn = document.querySelector(`input[name="saveAddr"]`);
const cancelAddr = document.querySelector(`input[name="cancelAddr"]`);
const editAddr = Array.from(document.getElementsByClassName(`editAddr`));
const delAddr = Array.from(document.getElementsByClassName(`delAddr`));
const defAddr = Array.from(document.getElementsByClassName(`defAddr`));
const resetErrors = () => {
  [addrTypeErr, addrPincodeErr, addrMobileErr, addrNameErr, addrLine1Err, addrLine2Err].forEach(sel => hideElement(sel));
};
addAddrBtn?.addEventListener('click', () => {
  showElement(addrForm, 'block');
  hideElement(addAddrBtn);
});
const clearAddrForm = () => {
  ['Work', 'Home'].forEach(addrTypeValue => (document.querySelector(`input[name="addrType"][value="${addrTypeValue}"]`).checked = false));
  [addrPincode, addrMobile, addrName, addrLine1, addrLine2, addrId].forEach(el => (el.value = ''));
  hideElement(addrForm);
  showElement(addAddrBtn);
};
cancelAddr?.addEventListener('click', () => {
  clearAddrForm();
});
const populateAddrForm = editAddrBtn => {
  const addrDiv = editAddrBtn.parentElement.querySelector('div');
  const addrTypeValue = addrDiv.querySelector('.address-type')?.innerText;
  document.querySelector(`input[name="addrType"][value="${addrTypeValue}"]`).checked = true;
  addrPincode.value = addrDiv.querySelector('.address-pincode')?.innerText;
  addrMobile.value = addrDiv.querySelector('.address-mobile')?.innerText?.replace('Phone Number: ', '');
  addrName.value = addrDiv.querySelector('.address-name')?.innerText;
  const [line1, line2] = addrDiv.querySelector('.address-text')?.innerHTML?.split('<br>');
  addrLine1.value = line1;
  addrLine2.value = line2;
  addrId.value = addrDiv.querySelector('.address-id')?.innerText || '';
};
const validateAddr = () => {
  let ok = true;
  const addrType = document.querySelector(`input[name="addrType"]:checked`);
  if (!addrType || (addrType && !['Home', 'Work'].find(t => t === addrType.value))) {
    showElement(addrTypeErr);
    ok = false;
  }
  if (!validatePincode(addrPincode.value)) {
    showElement(addrPincodeErr);
    ok = false;
  }
  if (!validateMobileNumber(addrMobile.value)) {
    showElement(addrMobileErr);
    ok = false;
  }
  if (!validateName(addrName.value)) {
    showElement(addrNameErr);
    ok = false;
  }
  if (!validateAddress(addrLine1.value)) {
    showElement(addrLine1Err);
    ok = false;
  }
  if (!validateAddress(addrLine2.value)) {
    showElement(addrLine2Err);
    ok = false;
  }
  return ok;
};
const disableAddrForm = disabledState => {
  // addrType?.disabled = disabledState;
  [addrPincode, addrMobile, addrName, addrLine1, addrLine2, addrId, saveAddrBtn, cancelAddr].forEach(el => el?.disabled == disabledState);
  if (disabledState) {
    showElement(loading);
    showElement(blurOverlay);
    // setBtnState(saveAddrBtn, 'Saving...', 'loading');
    return;
  }
  // setBtnState(saveAddrBtn, 'Save');
  hideElement(loading);
  hideElement(blurOverlay);
};
// Edit/Set-Default/Delete Address
document.querySelector('body').addEventListener('click', async function (event) {
  // Edit Address
  if (event.target.classList.contains('editAddr')) {
    // Hide already shown(by clicking any anchor tags) loading overlay
    hideElement(loading);
    hideElement(blurOverlay);
    hideElement(addAddrBtn);
    // Populate addrForm with selected addr info
    populateAddrForm(event.target);
    showElement(addrForm, 'block');
    document.querySelector('#layout main:nth-child(2)')?.scrollIntoView();
  }
  // Set default address
  if (event.target.classList.contains('defAddr')) {
    showElement(loading);
    showElement(blurOverlay);
    try {
      const ct = getCookie('ct');
      const addressToBeSetDefault = event.target?.parentElement;
      const id = addressToBeSetDefault?.querySelector('div .address-id')?.innerText;
      if (!id || isNaN(id)) {
        throw new Error();
      }
      const itemsToBeUpdated = { id, ct };
      const resp = await fetchData('/user/address', 'PUT', itemsToBeUpdated);
      switch (resp.status) {
        case 200:
          toast(resp.userMessage, 'success');
          Array.from(allAddresses)?.forEach(td => {
            // Remove default tag from all the addresses.
            td?.querySelectorAll('div .address-type')?.forEach(t => {
              if (t.innerText === 'Default') {
                t.remove();
              }
            });
            // Set 'delete' & 'set as default' btns
            const reqdBtns = ['delAddr', 'defAddr', 'editAddr'].filter(
              btnClass =>
                !Array.from(td.querySelectorAll('a'))
                  .map(a => a.className)
                  .includes(btnClass)
            );
            reqdBtns.forEach(btnClass => {
              let text = '';
              switch (btnClass) {
                case 'defAddr':
                  text = 'Set as Default';
                  break;
                case 'delAddr':
                  text = 'Remove';
                  break;
                case 'editAddr':
                  text = 'Edit';
                  break;
              }
              if (text) {
                // td.querySelector(`a.${btnClass}`)?. insertAdjacentHTML("afterend", `<a class="${btnClass}">${text}</a>`);
                showElement(td.querySelector(`a.${btnClass}`));
              }
            });
          });
          // Set default tag to the current address and hide/remove 'delete' & 'set as default' btns
          if (!Array.from(addressToBeSetDefault.querySelectorAll('div .address-type'))?.some(t => t.innerText === 'Default')) {
            addressToBeSetDefault.querySelector('div .address-type')?.insertAdjacentHTML('afterend', `<span class="address-type default">Default</span>`);
            // Hiding the buttons because removing them removes their event listener.
            hideElement(addressToBeSetDefault.querySelector('.delAddr'));
            hideElement(addressToBeSetDefault.querySelector('.defAddr'));
          }
          break;
        default:
          toast(resp.userMessage, 'error');
          break;
      }
    } catch (err) {
      toast('Something went wrong!', 'error');
    }
    hideElement(loading);
    hideElement(blurOverlay);
  }
  // Delete Address
  if (event.target.classList.contains('delAddr')) {
    showElement(loading);
    showElement(blurOverlay);
    try {
      const ct = getCookie('ct');
      const addressToBeDeleted = event.target?.parentElement;
      const id = addressToBeDeleted?.querySelector('div .address-id')?.innerText;
      if (!id || isNaN(id)) {
        throw new Error();
      }
      const itemsToBeUpdated = { id, ct };
      const resp = await fetchData('/user/address', 'DELETE', itemsToBeUpdated);
      switch (resp.status) {
        case 200:
          addressToBeDeleted.remove();
          toast(resp.userMessage, 'success');
          break;
        default:
          toast(resp.userMessage, 'error');
          break;
      }
    } catch (err) {
      toast('Something went wrong!', 'error');
    }
    hideElement(loading);
    hideElement(blurOverlay);
  }
});
// Save/Update address
saveAddrBtn?.addEventListener('click', async () => {
  resetErrors();
  if (validateAddr()) {
    // get data to be updated/inserted
    const addrType = document.querySelector(`input[name="addrType"]:checked`);
    let itemsToBeUpdated = {
      addrName: addrName.value,
      addrMobile: addrMobile.value,
      addrLine1: addrLine1.value,
      addrLine2: addrLine2.value,
      addrPincode: addrPincode.value,
      addrType: addrType.value,
      id: addrId.value,
      ct: ''
    };
    disableAddrForm(true);
    try {
      const ct = getCookie('ct');
      itemsToBeUpdated.ct = ct;
      const resp = await fetchData('/user/address', 'POST', itemsToBeUpdated);
      if (resp.validationErrors) {
        Object.entries(resp.validationErrors).forEach(([sel, errMsg]) => {
          setError(document.querySelector(`#${sel}`), errMsg);
        });
      }
      switch (resp.status) {
        case 200:
        case 201:
        case 304:
          if (!resp.validationErrors) {
            // Create/Update the address element.
            if (itemsToBeUpdated.id) {
              // Update
              const addrDivToUpdate = Array.from(document.querySelectorAll(`.address-id`))?.find(td => td.innerText === itemsToBeUpdated.id)?.parentElement;
              addrDivToUpdate.querySelector('.address-type').innerText = itemsToBeUpdated.addrType;
              addrDivToUpdate.querySelector('.address-name').innerText = itemsToBeUpdated.addrName;
              addrDivToUpdate.querySelector('.address-pincode').innerText = itemsToBeUpdated.addrPincode;
              addrDivToUpdate.querySelector('.address-id').innerText = itemsToBeUpdated.id;
              addrDivToUpdate.querySelector('.address-mobile').innerText = itemsToBeUpdated.addrMobile;
              addrDivToUpdate.querySelector('.address-text').innerHTML = itemsToBeUpdated.addrLine1 + '<br>' + itemsToBeUpdated.addrLine2;
              addrDivToUpdate.parentElement?.classList.add('glow');
              addrDivToUpdate.parentElement?.scrollIntoView();
            } else {
              // Add
              const lastAddrTd = Array.from(allAddresses).slice(-1)[0];
              const newAddressElem = `
              <td class="address glow">
                <div>
                  <span class="address-type">${itemsToBeUpdated.addrType}</span>
                  <br />
                  <span class="address-name"><b>${itemsToBeUpdated.addrName}</b></span>
                  <span class="address-text">${itemsToBeUpdated.addrLine1}<br>${itemsToBeUpdated.addrLine2}</span>
                  <span class="address-pincode">${itemsToBeUpdated.addrPincode}</span>
                  <span class="address-id hide">${resp.addrId}</span>
                  <br />
                  <span class="address-mobile">Phone Number: ${itemsToBeUpdated.addrMobile}</span>
                </div>
                <br />
                <a class="editAddr">Edit</a>
                <a class="defAddr">Set as Default</a>
                <a class="delAddr">Remove</a>
              </td>`;
              lastAddrTd?.insertAdjacentHTML('afterend', newAddressElem);
              lastAddrTd.scrollIntoView();
            }
            clearAddrForm();
            toast(resp.userMessage, 'success');
          }
          break;
        default:
          if (!resp.validationErrors) {
            toast(resp.userMessage || 'Something went wrong!', 'error');
          }
          break;
      }
    } catch (err) {
      toast('Something went wrong!', 'error');
    }
    Object.keys(itemsToBeUpdated).forEach(key => delete itemsToBeUpdated[key]);
    disableAddrForm(false);
  }
});

// ################################################################################################################################
// ## Wishlist ##
const addToWishlistBtns = document.querySelectorAll(`.addToWishlist`);
const removeFromWishlistBtns = document.querySelectorAll(`.removeItem`);
addToWishlistBtns?.forEach(addToWishlistBtn => {
  addToWishlistBtn.addEventListener('click', async function () {
    showElement(loading);
    showElement(blurOverlay);
    try {
      const ct = getCookie('ct');
      const productId = addToWishlistBtn.parentElement.querySelector(`input[name="productId"]`).value;
      if (!productId || isNaN(productId)) {
        throw new Error();
      }
      const payload = { productId, ct };
      const resp = await fetchData('/user/wishlist', 'POST', payload);
      switch (resp.status) {
        case 200:
          // loading.classList.add('success');
          // loading.innerText = resp.userMessage;
          toast(resp.userMessage, 'success');
          break;
        default:
          // loading.classList.add('err');
          // loading.innerText = resp.userMessage;
          toast(resp.userMessage, 'error');
          break;
      }
    } catch (err) {
      // loading.classList.add('err');
      // loading.innerText = 'Something went wrong!';
      toast(resp.userMessage, 'error');
    }
    // refreshPage();
  });
});
removeFromWishlistBtns?.forEach(removeFromWishlistBtn => {
  removeFromWishlistBtn.addEventListener('click', async function () {
    showElement(loading);
    showElement(blurOverlay);
    try {
      const ct = getCookie('ct');
      const productId = removeFromWishlistBtn.parentElement.querySelector(`input[name="productId"]`).value;
      if (!productId || isNaN(productId)) {
        throw new Error();
      }
      const payload = { productId, ct };
      const resp = await fetchData('/user/wishlist', 'DELETE', payload);
      switch (resp.status) {
        case 200:
          loading.classList.add('success');
          loading.innerText = resp.userMessage;
          break;
        default:
          loading.classList.add('err');
          loading.innerText = resp.userMessage;
          break;
      }
    } catch (err) {
      loading.classList.add('err');
      loading.innerText = 'Something went wrong!';
    }
    refreshPage();
  });
});

// ## Cart ##
const reduceQtyBtns = document.querySelectorAll(`.qty input[value="-"]`);
const addQtyBtns = document.querySelectorAll(`.qty input[value="+"]`);
reduceQtyBtns?.forEach(reduceQtyBtn => {
  reduceQtyBtn.addEventListener('click', function () {
    const qtyElem = reduceQtyBtn.parentElement.querySelector('.qtyValue');
    const discount = reduceQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.discount');
    const actualPrice = reduceQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.actual-price');
    const sellingPrice = reduceQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.selling-price');
    const deliveryDate = reduceQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.delivery-date');
    qtyElem.value = Number(qtyElem.value) - 1;
    if (qtyElem.value <= 0) {
      qtyElem.value = 1;
      reduceQtyBtn.disabled = true;
    } else {
      reduceQtyBtn.disabled = false;
    }
    // Send request to respective service to GET updated price.
    // We can't directly multiply price with qty because in actual ecommerce
    // there are certain rules, that apply to the sale of a particular product.
    // like if qty is 3, give more discount, if qty is 1 charge shipping fees etc.
    // following implementation is totally wrong.
    // actualPrice.innerText = formatAmount(getAmountFromString(actualPrice.innerText) * Number(qtyElem.value));
    // sellingPrice.innerText = formatAmount(getAmountFromString(sellingPrice.value) * Number(qtyElem.value));
  });
});
addQtyBtns?.forEach(addQtyBtn => {
  addQtyBtn.addEventListener('click', function () {
    const qtyElem = addQtyBtn.parentElement.querySelector('.qtyValue');
    const discount = addQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.discount');
    const actualPrice = addQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.actual-price');
    const sellingPrice = addQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.selling-price');
    const deliveryDate = addQtyBtn.parentElement.parentElement.previousElementSibling.querySelector('.delivery-date');
    qtyElem.value = Number(qtyElem.value) + 1;
    // Send request to respective service to GET updated price.
    // We can't directly multiply price with qty because in actual ecommerce
    // there are certain rules, that apply to the sale of a particular product.
    // like if qty is 3, give more discount, if qty is 1 charge shipping fees etc.
    // following implementation is totally wrong.
    // actualPrice.innerText = formatAmount(getAmountFromString(actualPrice.innerText) * Number(qtyElem.value));
    // sellingPrice.innerText = formatAmount(getAmountFromString(sellingPrice.value) * Number(qtyElem.value));
  });
});

// ################################################################################################################################
// ## Search ##
const searchResultsArr = Array.from(document.querySelectorAll(`div.search-results`));
const hideSearchResults = () => searchResultsArr.forEach(resultDiv => hideElement(resultDiv));
const showSearchResults = () => searchResultsArr.forEach(resultDiv => showElement(resultDiv));
// const searchResults = document.querySelector(`div.search-results`);
Array.from(document.querySelectorAll(`input[name="search"]`)).forEach(el =>
  el.addEventListener('click', () => {
    showSearchResults();
  })
);
document.onclick = function (e) {
  if (e.target.getAttribute('name') !== 'search') {
    hideSearchResults();
  }
};

// ################################################################################################################################
// Show loading before images are loaded ...
Array.from(document.images)
  .filter(imgElem => imgElem.classList.contains('img-item'))
  .map(
    imgElem =>
      (imgElem.onload = function () {
        imgElem.src = imgElem.getAttribute('data-src');
      })
  );

// Show login form on page load if requested.
window.onload = function () {
  (() => {
    const loginBtn = document.querySelector(`#login`);
    if (loginBtn?.getAttribute('data-testid') === 'loginRequested') {
      loginBtn.click();
      loginBtn.removeAttribute('data-testid');
    }
  })();
};
