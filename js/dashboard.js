document.addEventListener('DOMContentLoaded', function() {
  const userRole = localStorage.getItem('userRole');
  if (!userRole || userRole !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  fetch('http://localhost:8080/api/data')
    .then(response => response.json())
    .then(data => {
      document.getElementById('doctor-count').textContent = data.doctors.length;
      document.getElementById('patient-count').textContent = data.patients.length;
      document.getElementById('staff-count').textContent = data.staff.length;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Error loading dashboard data');
    });

  document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
  });
});