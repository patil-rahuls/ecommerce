window.fetchHelper = async function (url, method = 'GET', data = '', headers = '') {
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
      userMessage: `Something went wrong! Please try again.`
    };
  }
};

// ################################################################################################################################
// ## Navbar/Hamburger ##
const hamburgerBtn = document.getElementById('hamburger');
const navMenu = document.querySelector('.menu');
const metaMenu = document.querySelector('#meta');
const toggleHamburger = () => {
  metaMenu.classList.toggle('show');
  navMenu.classList.toggle('show');
};
hamburgerBtn.addEventListener('click', toggleHamburger);

// ################################################################################################################################
// ## dropdown menus ##
const dropdownBtn = document.querySelectorAll('.dropdown-btn');
const dropdown = document.querySelectorAll('.dropdown');
const links = document.querySelectorAll('.dropdown a');
const setAriaExpandedFalse = () => {
  dropdownBtn.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
};
const closeDropdownMenu = () => {
  dropdown.forEach(drop => {
    drop.classList.remove('active');
    drop.addEventListener('click', e => e.stopPropagation());
  });
};
dropdownBtn.forEach(btn => {
  btn.addEventListener('click', e => {
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
// close dropdown menu when the dropdown links are clicked
links.forEach(link =>
  link.addEventListener('click', () => {
    closeDropdownMenu();
    setAriaExpandedFalse();
    toggleHamburger();
  })
);
// close dropdown menu when you click on the document body
document.documentElement.addEventListener('click', () => {
  closeDropdownMenu();
  setAriaExpandedFalse();
});
// close dropdown when the escape key is pressed
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
const closePopup = popupSel => {
  !popupSel.classList.contains('hide') && popupSel.classList.add('hide');
  !loading.classList.contains('hide') && loading.classList.add('hide');
  !blurOverlay.classList.contains('hide') && blurOverlay.classList.add('hide');
};
// ## Popup/Modals - LoginForm ##
const loginForm = document.querySelector(`#loginForm`);
const closeLoginForm = () => {
  closePopup(loginForm);
};
blurOverlay.addEventListener('click', closeLoginForm);
document.querySelector(`.close-loginForm`).addEventListener('click', closeLoginForm);
document.querySelector(`#login`).addEventListener('click', async () => {
  blurOverlay.classList.remove('hide');
  loading.classList.remove('hide');
  try {
    const resp = await fetchHelper('/user/login');
    if (resp.status === 200) {
      loading.classList.add('hide');
      loginForm.classList.remove('hide');
    } else {
      loading.innerText = 'Something went wrong! Please try again.';
    }
  } catch (err) {
    loading.innerText = 'Something went wrong! Please try again.';
  }
});

// ################################################################################################################################
// ## Popup/Modals - LoginForm - CTAs ##
const continueBtn = document.querySelector(`[value="CONTINUE"]`);
const setContinueBtnState = (state = '') => {
  if (!state || state === 'LOGIN') {
    continueBtn.value = state || 'CONTINUE';
    continueBtn.style.backgroundColor = 'var(--primary-color)';
    return;
  }
  continueBtn.value = state;
  continueBtn.style.backgroundColor = 'darkorange';
};
const setError = (sel, msg) => {
  sel.classList.remove('hide');
  sel.innerText = msg;
};
const unSetError = sel => {
  sel.classList.add('hide');
  sel.innerText = '';
};
const loginId = document.querySelector('#loginId');
const loginIdErr = document.querySelector('#loginIdErr');
const password = document.querySelector('#password');
const passwordErr = document.querySelector('#passwordErr');
const passwordDiv = document.querySelector('#passwordDiv');
const isUsingPWSel = document.querySelector(`#pwlogin`);
isUsingPWSel.addEventListener('click', () => {
  if (isUsingPW) {
    isUsingPWSel.innerHTML = '<small>Login using Password</small>';
    password.setAttribute('placeholder', 'OTP');
    password.value = '';
    isUsingPW = false;
    unSetError(passwordErr);
  } else {
    isUsingPWSel.innerHTML = '<small>Login using OTP</small>';
    password.setAttribute('placeholder', 'Password');
    password.value = '';
    isUsingPW = true;
    unSetError(passwordErr);
  }
});
const loginErr = (sel, inputSel, errMsg = '') => {
  setError(sel, errMsg || `Couldn't sent OTP. Please try again!`);
  setContinueBtnState();
  continueBtn.disabled = false;
  inputSel.disabled = false;
};
const login = async () => {
  password.disabled = true;
  continueBtn.disabled = true;
  isUsingPWSel.classList.add('hide');
  unSetError(passwordErr);
  setContinueBtnState('Logging in...');
  try {
    const ct = document.cookie
      ?.split('; ')
      ?.filter(c => /ct=/.test(c))?.[0]
      ?.split('=')?.[1];
    const resp = await fetchHelper(
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
        loginErr(passwordErr, password, resp.userMessage);
        break;
      case 200:
        setContinueBtnState('WELCOME !!!');
        continueBtn.style.backgroundColor = '#34A853';
        // REFRESH PAGE
        window.location.reload();
        break;
      default:
        loginErr(passwordErr, password, resp.userMessage || 'Oops. something went wrong!');
        break;
    }
  } catch (err) {
    loginErr(passwordErr, password, 'Oops. something went wrong!');
  }
};
let isUsingPW;
continueBtn.addEventListener('click', async () => {
  blurOverlay.removeEventListener('click', closeLoginForm);
  if (!new RegExp(/^[6-9]\d{9}$/).test(loginId.value)) {
    setError(loginIdErr, 'Please re-check you mobile number');
    return;
  } else if (!passwordDiv.classList.contains('hide')) {
    if (isUsingPW) {
      if (/^[A-Za-z0-9_!@#$^./&+-]*$/.test(password.value) && password.value?.length > 5) {
        await login();
      } else {
        setError(passwordErr, 'Incorrect password');
        return;
      }
    } else if (!isUsingPW && password.value.length === 4 && !isNaN(password.value)) {
      await login();
    } else {
      setError(passwordErr, 'Incorrect OTP');
    }
  } else {
    // userId is correct
    unSetError(loginIdErr);
    loginId.disabled = true;
    setContinueBtnState('Sending OTP...');
    continueBtn.disabled = true;
    try {
      const ct = document.cookie
        ?.split('; ')
        ?.filter(c => /ct=/.test(c))?.[0]
        ?.split('=')?.[1];
      const resp = await fetchHelper(
        '/user/auth',
        'POST',
        { userId: loginId.value, ct },
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
          loginErr(loginIdErr, loginId, resp.userMessage);
          break;
        case 200:
          passwordDiv.classList.remove('hide');
          isUsingPWSel.classList.remove('hide');
          isUsingPWSel.style.cursor = 'pointer';
          continueBtn.disabled = false;
          setContinueBtnState('LOGIN');
          break;
        default:
          loginErr(loginIdErr, loginId, resp.userMessage || '');
          break;
      }
    } catch (err) {
      loginErr(loginIdErr, loginId);
    }
  }
});
