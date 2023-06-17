import React, { useEffect, useState } from 'react';
import Home from './home';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegUsername] = useState('');
  const [registerPassword, setRegPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    fetch('/check-session').then((response) => {
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      console.error('Error checking session:', error);
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('/userLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    }).then((response) => {
        if (response.ok) {
          Swal.fire({
            title: 'Success',
            text: 'Logged in successfully!',
            icon: 'success',
          }).then(async () => {
            response = await response.json();
            setIsLoggedIn(true);
            setTimeout(() => {
              document.getElementById('user').innerHTML = response.username;
              document.getElementById('id').innerHTML = response.id;
            }, 500);
          });
        } else if (response.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Invalid username or password',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Login failed: ' + response.status,
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Login failed: ' + error,
        });
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    fetch('/userRegister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ registerUsername, registerPassword })
    }).then(async response => {
      if (response.ok) {
        Swal.fire({
          title: 'Success',
          text: 'Registered successfully!',
          icon: 'success'
        }).then(() => {
          setIsRegistered(true);
        });
      } else if (response.status === 401) {
        response = await response.json();
        switch(response.error) {
          case 'password_regex':
            Swal.fire({
              icon: 'error',
              title: 'Password not secure enough...',
              html: 
              `<ul style="text-align: left;">
              <li>The password must be at least 8 characters long.</li>
              <li>It must contain at least one letter (uppercase or lowercase).</li>
              <li>It must contain at least one digit.</li>
              <li>It must contain at least one special character from the set <code>@$!%*#?</code></li>
              </ul>`,
            });                            
            break;
          default:
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: response.error
            });
            break;
        }
      } else {
        response = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: response.error
        });
      }
    }).catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error
      });
    });
  };

  if(isLoading) {
    return <p>Loading...</p>;
  }

  if (isLoggedIn || isRegistered) {
    return <Home />;
  } else {
    return (
      <div className="container">
        <div className="form-container">
          <form id="login-form" className="form" onSubmit={handleLogin}>
            <div className="form-header">
              <h2>Login</h2>
              <button type="button" id="show-register">Register</button>
            </div>
            <input type="text" id="login-username" onChange={(e => setUsername(e.target.value))} placeholder="Username" required value={username} autoComplete="off" />
            <input type="password" id="login-password" onChange={(e => setPassword(e.target.value))} placeholder="Password" required value={password} autoComplete="off" />
            <button type="submit">Login</button>
          </form>
          <form id="register-form" className="form" onSubmit={handleRegister}>
            <div className="form-header">
              <h2>Register</h2>
              <button type="button" id="show-login">Login</button>
            </div>
            <input type="text" id="register-username" onChange={(e => setRegUsername(e.target.value))} minLength="4" maxLength="16" placeholder="Username" required value={registerUsername} autoComplete="off" />
            <input type="password" id="register-password" onChange={(e => setRegPassword(e.target.value))} placeholder="Password" required value={registerPassword} autoComplete="off" />
            <button type="submit">Register</button>
            <ul><li>The password must be at least 8 characters long.</li><li>It must contain at least one letter (uppercase or lowercase).</li><li>It must contain at least one digit.</li><li>It must contain at least one special character from the set <code>@$!%*#?&amp;</code></li></ul>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
