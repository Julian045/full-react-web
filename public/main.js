function isLoggedIn() {
    return fetch('/check-session', {
      method: 'GET',
      credentials: 'same-origin' // Send cookies with the request
    }).then(async response => {
        if (response.ok) {
          response = await response.json();
          setTimeout(() => {
            document.getElementById('user').innerHTML = response.username;
            document.getElementById('id').innerHTML = response.id;
          }, 500);
          return true;
        } else {
          //window.location.href = '/login';
          return false;
        }
    }).catch(error => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error checking session: ' + error
    });
    return false;
    });
}

isLoggedIn().then(loggedIn => {
    if (loggedIn) {} else window.location.href = "/login";
});

function deleteAccount() {
    Swal.fire({
        title: 'Delete Account',
        html: `
            <input type="text" id="username" class="swal2-input" placeholder="Username" required>
            <input type="password" id="password" class="swal2-input" placeholder="Password" required>
        `,
        showCancelButton: true,
        confirmButtonText: 'Delete',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
    
            const data = { username, password };
    
            return fetch(`/deleteAccount`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.status === 401) {
                    throw new Error('Invalid username or password.');
                }
            }).catch(error => {
                Swal.showValidationMessage(`Request failed: ${error}`);
            });
        },
    }).then(result => {
        if (result.isConfirmed) {
            Swal.fire({
                title:'Deleted!',
                text:'Your account has been deleted.',
                icon: 'success'
            }).then(() => {
                //window.location.href = '/login';
            });
        }
    });
}