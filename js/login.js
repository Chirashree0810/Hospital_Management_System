document.getElementById('login-btn').addEventListener('click', function() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('error-message');

  fetch('http://localhost:8080/api/data')
    .then(response => response.json())
    .then(data => {
      const user = data.users.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', username);
        if (user.role === 'admin') {
          window.location.href = 'dashboard.html';
        } else if (user.role === 'doctor') {
          window.location.href = 'doctor.html';
        }/* else if (user.role === 'staff') {
          window.location.href = 'staff.html';
        }*/
      } else {
        errorMessage.classList.remove('hidden');
        errorMessage.textContent = 'Invalid username or password';
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = 'Error connecting to server';
    });
});