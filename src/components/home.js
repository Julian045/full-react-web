import React, { useEffect, useState } from 'react';
import Login from './Login';

function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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

    const handleLogout = () => {
        fetch('/logout').then((response) => {
            if(response.ok) setIsLoggedIn(false);
            else setIsLoggedIn(true);
            setIsLoading(false);
        }).catch((error) => {
            setIsLoading(false);
            console.log('Error logging out:' + error);
        });
    };

    const handleDeleteAccount = () => {
        Swal.fire({
            title: 'Delete Account',
            html:
              '<input id="username" type="text" placeholder="Username">' +
              '<input id="password" type="password" placeholder="Password">',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            preConfirm: () => {
              const username = Swal.getPopup().querySelector('#username').value;
              const password = Swal.getPopup().querySelector('#password').value;
              return { username, password };
            },
          }).then(result => {
            if (result.isConfirmed) {
                const { username, password } = result.value;
                fetch('/deleteAccount', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                }).then(response => {
                    if(response.ok) {
                        Swal.fire({
                            position: 'top-end',
                            icon: 'success',
                            title: 'Your account has been deleted.',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        setIsLoggedIn(false);
                    } else if(response.status === 401) {
                        setIsLoggedIn(true);
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: "Invalid username or password"
                        });
                    }
                    setIsLoading(false);
                }).catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error
                    });
                    setIsLoading(false);
                });
            }
          });
    };

    if(isLoading) {
        return <p>Loading...</p>;
    }

    if(isLoggedIn) {
        const loadMain = document.createElement('script');
        loadMain.type = "text/javascript";
        loadMain.src = "/public/main.js";
        loadMain.async = true;
        document.body.appendChild(loadMain);
        return (
            <div>
                <h1>Hello World</h1>
                <p>Hello, <a id="user">User</a>! You are logged in.
                    Your id: <a id="id">ID</a>
                </p>

                <button onClick={handleLogout}>Logout</button><hr></hr>
                <button onClick={handleDeleteAccount}>Delete Account</button>
            </div>
        );
    } else return <Login />;
}

export default Home;