// Navbar
// Thanks to this - https://www.freecodecamp.org/news/how-to-build-a-responsive-navigation-bar-with-dropdown-menu-using-javascript/
const hamburgerBtn = document.getElementById('hamburger');
const navMenu = document.querySelector('.menu');
const metaMenu = document.querySelector('#meta');
function toggleHamburger() {
  metaMenu.classList.toggle('show');
  navMenu.classList.toggle('show');
}
hamburgerBtn.addEventListener('click', toggleHamburger);

// navbar menus
const dropdownBtn = document.querySelectorAll('.dropdown-btn');
const dropdown = document.querySelectorAll('.dropdown');
const links = document.querySelectorAll('.dropdown a');
function setAriaExpandedFalse() {
  dropdownBtn.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
}
function closeDropdownMenu() {
  dropdown.forEach(drop => {
    drop.classList.remove('active');
    drop.addEventListener('click', e => e.stopPropagation());
  });
}
dropdownBtn.forEach(btn => {
  btn.addEventListener('click', function (e) {
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
// toggle hamburger menu

const loginBtn = document.querySelector(`#login`);
const loginOverlay = document.querySelector(`#loginOverlay`);
const loginForm = document.querySelector(`#loginForm`);
// Login Popup
loginBtn.addEventListener('click', () => {
  loginOverlay.classList.add('blurOverlay');
  loginForm.style.display = 'block';
});
loginOverlay.addEventListener('click', () => {
  loginForm.style.display = 'none';
  loginOverlay.classList.remove('blurOverlay');
});
document.querySelector(`.close-loginForm`).addEventListener('click', () => {
  loginForm.style.display = 'none';
  loginOverlay.classList.remove('blurOverlay');
});

// Login
const continueBtn = document.querySelector(`[value="CONTINUE"]`);
const setContinueBtnState = (state = '') => {
  if (!state) {
    continueBtn.value = 'Login';
    continueBtn.style.backgroundColor = 'var(--primary-color)';
    return;
  }
  continueBtn.value = state;
  continueBtn.style.backgroundColor = 'darkorange';
};
const setError = (sel, msg) => {
  sel.classList.add('err');
  sel.classList.remove('hide');
  sel.innerText = msg;
};
const unSetError = sel => {
  sel.classList.add('hide');
  sel.classList.remove('err');
  sel.innerText = '';
  sel.disabled = true;
};
const loginId = document.querySelector('#loginId');
const loginIdErr = document.querySelector('#loginIdErr');
const password = document.querySelector('#password');
const passwordErr = document.querySelector('#passwordErr');
const passwordDiv = document.querySelector('#passwordDiv');
let isUsingPW;
const isUsingPWSel = document.querySelector(`#pwlogin`);
isUsingPWSel.addEventListener('click', () => {
  if (isUsingPW) {
    isUsingPWSel.innerHTML = '<small>Login using OTP</small>';
    password.setAttribute('placeholder', 'OTP');
    password.value = '';
    isUsingPW = false;
  } else {
    isUsingPWSel.innerHTML = '<small>Login using Password</small>';
    password.setAttribute('placeholder', 'Password');
    password.value = '';
    isUsingPW = true;
  }
});
continueBtn.addEventListener('click', async () => {
  if (!new RegExp(/^[6-9]\d{9}$/).test(loginId.value)) {
    setError(loginIdErr, 'Please re-check you mobile number');
    return;
  } else if (!passwordDiv.classList.contains('hide')) {
    if (isUsingPW) {
      if (password.value?.length > 5) {
        await login();
      } else {
        setError(passwordErr, 'Incorrect password');
        return;
      }
    } else if (!isUsingPW && password.value.length === 4 && !isNaN(password.value)) {
      await login();
    } else {
      setError(passwordErr, 'Incorrect OTP');
      return;
    }
  } else {
    // mobile is correct
    unSetError(loginIdErr);
    setContinueBtnState('Sending OTP...');
    continueBtn.disabled = true;
    setTimeout(() => {
      continueBtn.disabled = false;
      setContinueBtnState();
      loginId.disabled = true;
      passwordDiv.classList.remove('hide');
      isUsingPWSel.classList.remove('hide');
      isUsingPWSel.style.cursor = 'pointer';
    }, 3000);
  }
});
const login = async () => {
  password.disabled = true;
  isUsingPWSel.classList.add('hide');
  continueBtn.disabled = true;
  unSetError(passwordErr);
  setContinueBtnState('Logging in...');
  const resp = await post('/login', { element: 'osmium' });
  // WIP
};
window.post = async function (url, data) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  } catch (err) {
    return {
      status: 500,
      userMessage: `Something went wrong! Please try again.`
    };
  }
};
