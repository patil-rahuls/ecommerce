// ################################################################################################################################
// ## Common ##
const GENERIC_ERR = 'Please try again!';
const fetchData = async (url, method = 'GET', data = '', headers = '') => {
  try {
    const res = await fetch(url, {
      method,
      headers: headers ? headers : { 'Content-Type': 'application/json' },
      ...(method === 'POST' && { body: JSON.stringify(data) })
    });
    return await res.json();
  } catch (err) {
    return {
      status: 500,
      userMessage: `Something went wrong!`
    };
  }
};
const refreshPage = (delay = 2000) => {
  setTimeout(() => {
    window.location.reload();
  }, delay);
};
const getCookie = cookieType => {
  const regxPattern = new RegExp(String.raw`${cookieType}=`);
  return document.cookie
    ?.split('; ')
    ?.filter(c => regxPattern.test(c))?.[0]
    ?.split('=')?.[1];
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
  const regxPattern = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
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

const hideElement = sel => {
  !sel.classList.contains('hide') && sel.classList.add('hide');
};
const showElement = (sel, displayProp = '') => {
  sel.classList.contains('hide') && sel.classList.remove('hide');
  if (displayProp) {
    sel.style.display = displayProp;
  }
};
const setBtnState = (btnSel, inrTxt, displayProp = '') => {
  btnSel.value = inrTxt || 'CONTINUE';
  if (!displayProp) {
    btnSel.classList.contains('loading') && btnSel.classList.remove('loading');
    btnSel.style.backgroundColor = 'var(--primary-color)';
    return;
  }
  btnSel.classList.add(displayProp);
};

// ################################################################################################################################
// ## Navbar/Hamburger ##
const toggleHamburger = () => {
  document.querySelector('#meta').classList.toggle('show-flex');
  document.querySelector('.menu').classList.toggle('show');
};
document.getElementById('hamburger').addEventListener('click', toggleHamburger);

// ################################################################################################################################
// ## Dropdown Menus ##
const dropdownBtn = document.querySelectorAll('.dropdown-btn');
const dropdown = document.querySelectorAll('.dropdown');
const setAriaExpandedFalse = () => {
  dropdownBtn.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
};
const closeDropdownMenu = () => {
  dropdown.forEach(drop => {
    drop.classList.remove('active');
    drop?.addEventListener('click', e => e.stopPropagation());
  });
};
// hide/close drpdwn-menu when clicked on the document body
document.documentElement.addEventListener('click', () => {
  closeDropdownMenu();
  setAriaExpandedFalse();
});
// hide/close drpdwn-menu when dropdown lnks are clicked.
document.querySelectorAll('.dropdown a').forEach(link =>
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
    dropdownElement.classList.toggle('active');
    dropdown.forEach(drop => {
      if (drop.id !== btn.dataset['dropdown']) {
        drop.classList.remove('active');
      }
    });
    e.stopPropagation();
    btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
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
const closePopup = popupSel => {
  hideElement(popupSel);
  hideElement(loading);
  hideElement(blurOverlay);
};
const toggleLoading = (show = '') => {
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
const loginForm = document.querySelector(`#loginForm`);
const closeLoginFormSel = document.querySelector(`.close-loginForm`);
const closeLoginForm = () => {
  closePopup(loginForm);
  refreshPage(0); // This may affect UX.
};
blurOverlay.addEventListener('click', closeLoginForm);
closeLoginFormSel?.addEventListener('click', closeLoginForm);
retryBtn?.addEventListener('click', () => {
  refreshPage(0);
});
document.querySelector(`#login`)?.addEventListener('click', async () => {
  toggleLoading(true);
  try {
    const resp = await fetchData('/user/login');
    if (resp.status === 200) {
      hideElement(loading);
      showElement(loginForm);
    } else {
      loading.innerText = GENERIC_ERR;
      showElement(retryBtn);
    }
  } catch (err) {
    loading.innerText = GENERIC_ERR;
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
    isUsingPWSel.innerHTML = '<small>Login using Password?</small>';
    password.setAttribute('placeholder', 'OTP');
    password.value = '';
    isUsingPW = false;
    unSetError(passwordErr);
  } else {
    isUsingPWSel.innerHTML = '<small>Login using OTP?</small>';
    password.setAttribute('placeholder', 'Password');
    password.value = '';
    isUsingPW = true;
    unSetError(passwordErr);
  }
});
const loginErr = (sel, inputSel, errMsg = '') => {
  setError(sel, errMsg || `Couldn't sent OTP. Please try again!`);
  setBtnState(continueBtn, 'RETRY');
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
    const resp = await fetchData(
      '/user/verify',
      'POST',
      { userId: loginId.value, passkey: password.value, ct },
      {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': ct,
        credentials: 'include'
      }
    );
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
        // closeLoginFormSel.removeEventListener('click', closeLoginForm);
        // closeLoginFormSel.remove();
        setBtnState(continueBtn, 'Just a sec...', 'success');
        refreshPage();
        break;
      default:
        continueBtn.disabled = false;
        setBtnState(continueBtn, 'LOGIN');
        loginErr(passwordErr, password, resp.userMessage || 'Oops. something went wrong!');
        break;
    }
  } catch (err) {
    continueBtn.disabled = false;
    setBtnState(continueBtn, 'LOGIN');
    loginErr(passwordErr, password, 'Oops. something went wrong!');
  }
};
continueBtn?.addEventListener('click', async () => {
  blurOverlay.removeEventListener('click', closeLoginForm);
  if (loginId.value?.length !== 10 || isNaN(loginId.value) || !new RegExp(/^[6-9]\d{9}$/).test(loginId.value)) {
    setError(loginIdErr, 'Please enter a valid mobile-number!');
    return;
  } else if (loginIdOk && !passwordDiv.classList.contains('hide')) {
    switch (true) {
      case isUsingPW:
        if (password.value?.length > 5 && /^[A-Za-z0-9_!@#$^./&+-]*$/.test(password.value)) {
          await login();
        } else {
          setError(passwordErr, 'Password is incorrect!');
          return;
        }
        break;
      case !isUsingPW:
        if (password.value.length === 4 && !isNaN(password.value)) {
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
      const resp = await fetchData(
        '/user/auth',
        'POST',
        { userId: loginId.value, ct },
        {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': ct,
          credentials: 'include'
        }
      );
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
          isUsingPWSel.style.cursor = 'pointer';
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
let err;
const rePwTr = document.querySelector('#re-password');
const changePwLink = document.querySelector(`#changePassword`);
const profilePassword = document.querySelector('input[name="password"]');
const profileRePassword = document.querySelector('input[name="repassword"]');
const profileName = document.querySelector(`input[name="name"]`);
const profileEmail = document.querySelector(`input[name="email"]`);
const profileGender = document.querySelector(`select[name="gender"]`);
const updateProfileBtn = document.querySelector('#update-profile');
changePwLink?.addEventListener('click', function () {
  changePwLink.classList.add('hide');
  rePwTr.classList.remove('hide');
  profilePassword.classList.remove('hide');
});
const itemsToBeUpdated = {};
const showProfileUpdateErrors = (sel, msg) => {
  const errParent = document.querySelector(`#${sel}`);
  errParent.classList.remove('hide');
  errParent.querySelector('span').innerText = msg;
  err = true;
};
const resetProfileUpdateErrors = () => {
  [`#nameErr`, `#emailErr`, `#genderErr`, `#profilePasswordErr`, `#profileRePasswordErr`, `#profileUpdateErr`].forEach(
    sel => {
      const errParent = document.querySelector(sel);
      errParent.querySelector('span').innerText = '';
      if (!errParent.classList.contains('hide')) {
        errParent.classList.add('hide');
      }
      err = false;
    }
  );
};
const disableProfileForm = disabledState => {
  changePwLink.disabled = disabledState;
  profilePassword.disabled = disabledState;
  profileRePassword.disabled = disabledState;
  profileName.disabled = disabledState;
  profileEmail.disabled = disabledState;
  profileGender.disabled = disabledState;
  updateProfileBtn.disabled = disabledState;
  loading.classList.toggle('hide');
  blurOverlay.classList.toggle('hide');
  updateProfileBtn.classList.toggle('loading');
  if (disabledState) {
    updateProfileBtn.innerText = 'Updating...';
    return;
  }
  updateProfileBtn.innerText = 'Update';
};
const updateProfile = async () => {
  disableProfileForm(true);
  try {
    if (!err && Object.keys(itemsToBeUpdated).length) {
      const ct = getCookie('ct');
      itemsToBeUpdated.ct = ct;
      const resp = await fetchData('/user/profile', 'POST', itemsToBeUpdated, {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': ct,
        credentials: 'include'
      });
      Object.keys(itemsToBeUpdated).forEach(key => delete itemsToBeUpdated[key]);
      switch (resp.status) {
        case 200:
        case 304:
          document.querySelector(`#profileUpdateErr`).classList.remove('err');
          document.querySelector(`#profileUpdateErr`).classList.add('success');
          showProfileUpdateErrors('profileUpdateErr', resp.userMessage);
          break;
        default:
          if (resp.validationErrors) {
            Object.entries(resp.validationErrors).forEach(([sel, errMsg]) => {
              showProfileUpdateErrors(sel, errMsg);
            });
          } else {
            showProfileUpdateErrors('profileUpdateErr', resp.userMessage || 'Something went wrong!');
          }
          break;
      }
    }
  } catch (err) {
    showProfileUpdateErrors('profileUpdateErr', 'Something went wrong!');
  }
  disableProfileForm(false);
};
updateProfileBtn?.addEventListener('click', async () => {
  resetProfileUpdateErrors();
  if (profileName.value) {
    if (validateName(profileName.value)) {
      itemsToBeUpdated.name = profileName.value;
    } else {
      showProfileUpdateErrors('nameErr', `Invalid Name`);
    }
  }
  if (profileEmail.value) {
    if (validateEmail(profileEmail.value)) {
      itemsToBeUpdated.email = profileEmail.value;
    } else {
      showProfileUpdateErrors('emailErr', `Invalid Email ID`);
    }
  }
  if (profileGender.value) {
    if (validateGender(profileGender.value)) {
      itemsToBeUpdated.gender = profileGender.value;
    } else {
      showProfileUpdateErrors('genderErr', `Please select a Gender`);
    }
  }
  if (profilePassword.value) {
    if (validatePassword(profilePassword.value)) {
      if (profilePassword.value === profileRePassword.value) {
        itemsToBeUpdated.password = profilePassword.value;
        itemsToBeUpdated.repassword = profileRePassword.value;
      } else {
        showProfileUpdateErrors('profileRePasswordErr', `Passwords didn't match`);
      }
    } else {
      showProfileUpdateErrors('profilePasswordErr', `Please try another one`);
    }
  }
  await updateProfile();
});

// ################################################################################################################################
// ## User Address ##
const addAddrBtn = document.querySelector(`#add-address`);
const addrForm = document.querySelector(`.addressForm `);
const addrLine1 = document.querySelector(`input[name="addrLine1"]`);
const addrLine2 = document.querySelector(`input[name="addrLine2"]`);
const addrPincode = document.querySelector(`input[name="addrPincode"]`);
const addrMobile = document.querySelector(`input[name="addrMobile"]`);
const addrName = document.querySelector(`input[name="addrName"]`);
const addrType = document.querySelector(`input[name="addrType"]:checked`);
const addrId = document.querySelector(`input[name="addrId"]`);
const saveAddrBtn = document.querySelector(`input[name="saveAddr"]`);
const cancelAddr = document.querySelector(`input[name="cancelAddr"]`);
const editAddr = Array.from(document.querySelectorAll(`a.editAddr`));
const delAddr = document.querySelector(`a.delAddr`);
const defAddr = document.querySelector(`a.defAddr`);
const showHideEl = (sel, prop) => {
  sel.style.display = prop;
};
addAddrBtn?.addEventListener('click', () => {
  showHideEl(addrForm, 'inline-grid');
  showHideEl(addAddrBtn, 'none');
});
const clearAddrForm = () => {
  ['Work', 'Home'].forEach(
    addrTypeValue => (document.querySelector(`input[name="addrType"][value="${addrTypeValue}"]`).checked = false)
  );
  addrPincode.value = '';
  addrMobile.value = '';
  addrName.value = '';
  addrLine1.value = '';
  addrLine2.value = '';
  addrId.value = '';
};
cancelAddr?.addEventListener('click', () => {
  showHideEl(addrForm, 'none');
  clearAddrForm();
  showHideEl(addAddrBtn, 'block');
});
const populateAddrForm = editAddrBtn => {
  const addrDiv = editAddrBtn.parentElement.querySelector('div');
  const addrTypeValue = addrDiv.querySelector('.address-type')?.innerText;
  document.querySelector(`input[name="addrType"][value="${addrTypeValue}"]`).checked = true;
  addrPincode.value = addrDiv.querySelector('.address-pincode')?.innerText;
  addrMobile.value = addrDiv.querySelector('.address-mobile')?.innerText?.replace('Phone Number: ', '');
  addrName.value = addrDiv.querySelector('.address-name')?.innerText;
  const fullAddrText = addrDiv.querySelector('.address-text')?.innerText;
  // divide fullAddrText into two parts. addr line1 & line 2
  const quotient = Math.floor(fullAddrText?.split(' ')?.length / 2);
  addrLine1.value = fullAddrText?.split(' ')?.slice(0, quotient)?.join();
  addrLine2.value = fullAddrText?.split(' ')?.slice(quotient)?.join();
  addrId.value = addrDiv.querySelector('.address-id')?.innerText || '';
};
editAddr?.forEach(editAddrBtn => {
  editAddrBtn.addEventListener('click', () => {
    showHideEl(addAddrBtn, 'none');
    // Populate addrForm with selected addr info
    populateAddrForm(editAddrBtn);
    showHideEl(addrForm, 'inline-grid');
  });
});
const resetErrors = () => {
  document.querySelector('.addrTypeErr').classList.add('hide');
  document.querySelector('.addrPincodeErr').classList.add('hide');
  document.querySelector('.addrMobileErr').classList.add('hide');
  document.querySelector('.addrNameErr').classList.add('hide');
  document.querySelector('.addrLine1Err').classList.add('hide');
  document.querySelector('.addrLine2Err').classList.add('hide');
  document.querySelector('.addrUpdateErr').classList.add('hide');
};
const validateAddr = () => {
  let ok = true;
  const addrType = document.querySelector(`input[name="addrType"]:checked`);
  if (!['Home', 'Work'].find(t => t === addrType.value)) {
    document.querySelector('.addrTypeErr').classList.remove('hide');
    ok = false;
  }
  if (!validatePincode(addrPincode.value)) {
    document.querySelector('.addrPincodeErr').classList.remove('hide');
    ok = false;
  }
  if (!validateMobileNumber(addrMobile.value)) {
    document.querySelector('.addrMobileErr').classList.remove('hide');
    ok = false;
  }
  if (!validateName(addrName.value)) {
    document.querySelector('.addrNameErr').classList.remove('hide');
    ok = false;
  }
  if (!validateAddress(addrLine1.value)) {
    document.querySelector('.addrLine1Err').classList.remove('hide');
    ok = false;
  }
  if (!validateAddress(addrLine2.value)) {
    document.querySelector('.addrLine2Err').classList.remove('hide');
    ok = false;
  }
  return ok;
};
const disableAddrForm = disabledState => {
  addrLine1.disabled = disabledState;
  addrLine2.disabled = disabledState;
  addrPincode.disabled = disabledState;
  addrMobile.disabled = disabledState;
  addrName.disabled = disabledState;
  // addrType?.disabled = disabledState;
  saveAddrBtn.disabled = disabledState;
  cancelAddr.disabled = disabledState;
  loading.classList.toggle('hide');
  blurOverlay.classList.toggle('hide');
  saveAddrBtn.classList.toggle('loading');
  if (disabledState) {
    saveAddrBtn.innerText = 'Saving...';
    return;
  }
  saveAddrBtn.innerText = 'Save';
};
const showAddrUpdateErrors = (sel, errMsg) => {
  const el = document.querySelector(sel);
  el.classList.remove('hide');
  el.innerText = errMsg;
};
saveAddrBtn?.addEventListener('click', async () => {
  resetErrors();
  if (validateAddr()) {
    // get data to be  updated/inserted
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
    let ok;
    try {
      const ct = getCookie('ct');
      itemsToBeUpdated.ct = ct;
      const resp = await fetchData('/user/address', 'POST', itemsToBeUpdated, {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': ct,
        credentials: 'include'
      });
      Object.keys(itemsToBeUpdated).forEach(key => delete itemsToBeUpdated[key]);
      switch (resp.status) {
        case 200:
        case 304:
          document.querySelector(`.addrUpdateErr`).classList.remove('err');
          document.querySelector(`.addrUpdateErr`).classList.add('success');
          showAddrUpdateErrors('.addrUpdateErr', resp.userMessage);
          // Show success popup & reload page.
          loading.innerText = 'Address Saved!';
          ok = true;
          refreshPage();
          break;
        default:
          if (resp.validationErrors) {
            Object.entries(resp.validationErrors).forEach(([sel, errMsg]) => {
              showAddrUpdateErrors(sel, errMsg);
            });
          } else {
            showAddrUpdateErrors('.addrUpdateErr', resp.userMessage || 'Something went wrong!');
          }
          break;
      }
    } catch (err) {
      showAddrUpdateErrors('.addrUpdateErr', 'Something went wrong!');
    }
    !ok && disableAddrForm(false);
  }
});

// ################################################################################################################################
// ## Search ##
const searchResultsArr = Array.from(document.querySelectorAll(`div.search-results`));
const hideSearchResults = () => searchResultsArr.forEach(resultDiv => resultDiv.classList.add('hide'));
const showSearchResults = () => searchResultsArr.forEach(resultDiv => resultDiv.classList.remove('hide'));
const searchResults = document.querySelector(`div.search-results`);
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
