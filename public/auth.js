window.onload = () => {
  setTimeout(function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterButton = document.getElementById('show-register');
    const showLoginButton = document.getElementById('show-login');
    const regPassInput = document.getElementsByTagName('input')[3];
    const registerButton = document.getElementsByTagName('button')[3];
    const ul = document.getElementsByTagName('ul')[0];

    if(!regPassInput) return;
    regPassInput.addEventListener('input', function() {
        if(regPassInput.value.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)) {
            registerButton.disabled = false;
            registerButton.style.backgroundColor = '#45a049';
            ul.style.display = "none";
        } else {
            registerButton.disabled = true;
            registerButton.style.backgroundColor = '#b11212';
            ul.style.display = "block";
        }
    });

    if(!registerForm) return;
    registerForm.style.display = 'none';
    ul.style.display = "none";

    showRegisterButton.addEventListener('click', function() {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    });

    showLoginButton.addEventListener('click', function() {
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }, 500);
};