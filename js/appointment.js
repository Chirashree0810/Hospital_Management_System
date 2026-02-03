document.addEventListener('DOMContentLoaded', function() {
  const userRole = localStorage.getItem('userRole');
  if (!userRole || userRole !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  const appointmentList = document.getElementById('appointment-list');
  const doctorSelect = document.getElementById('doctor-id');
  const patientSelect = document.getElementById('patient-id');
  let appointments = [];
  let doctors = [];
  let patients = [];

  Promise.all([
    fetch('http://localhost:8080/api/appointments').then(res => res.json()),
    fetch('http://localhost:8080/api/doctors').then(res => res.json()),
    fetch('http://localhost:8080/api/patients').then(res => res.json())
  ])
    .then(([appointmentsData, doctorsData, patientsData]) => {
      appointments = appointmentsData;
      doctors = doctorsData;
      patients = patientsData;

      doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        doctorSelect.appendChild(option);
      });

      patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = patient.name;
        patientSelect.appendChild(option);
      });

      appointments.forEach(appointment => {
        const doctor = doctors.find(d => d.id === appointment.doctorId);
        const patient = patients.find(p => p.id === appointment.patientId);
        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-100');
        row.innerHTML = `
          <td class="p-2">${doctor ? doctor.name : 'Unknown'}</td>
          <td class="p-2">${patient ? patient.name : 'Unknown'}</td>
          <td class="p-2">${patient ? patient.phone : 'N/A'}</td>
          <td class="p-2">${patient ? patient.medicalRecord : 'N/A'}</td>
          <td class="p-2">${appointment.date}</td>
          <td class="p-2">${appointment.time}</td>
          <td class="p-2">
            <button class="edit-btn bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600" data-id="${appointment.id}">Edit</button>
            <button class="delete-btn bg-red-500 text-white p-1 rounded hover:bg-red-600 ml-2" data-id="${appointment.id}">Delete</button>
          </td>
        `;
        appointmentList.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Error loading appointments');
    });

  const modal = document.getElementById('appointment-modal');
  const modalTitle = document.getElementById('modal-title');
  const appointmentForm = document.getElementById('appointment-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const errorMessage = document.getElementById('error-message');
  let editId = null;

  document.getElementById('add-appointment-btn').addEventListener('click', () => {
    modalTitle.textContent = 'Add Appointment';
    appointmentForm.reset();
    errorMessage.classList.add('hidden');
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').value = today;
    editId = null;
    modal.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    errorMessage.classList.add('hidden');
  });

  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const doctorId = parseInt(document.getElementById('doctor-id').value);
    const patientId = parseInt(document.getElementById('patient-id').value);
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = 'Date cannot be in the past';
      return;
    }

    const appointmentData = { doctorId, patientId, date, time };

    if (editId) {
      fetch(`http://localhost:8080/api/appointments/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to update appointment');
          location.reload();
        })
        .catch(error => {
          console.error('Error updating appointment:', error);
          alert('Error updating appointment');
        });
    } else {
      fetch('http://localhost:8080/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add appointment');
          location.reload();
        })
        .catch(error => {
          console.error('Error adding appointment:', error);
          alert('Error adding appointment');
        });
    }
    modal.classList.add('hidden');
  });

  appointmentList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const id = parseInt(e.target.dataset.id);
      fetch('http://localhost:8080/api/appointments')
        .then(response => response.json())
        .then(appointments => {
          const appointment = appointments.find(a => a.id === id);
          document.getElementById('doctor-id').value = appointment.doctorId;
          document.getElementById('patient-id').value = appointment.patientId;
          document.getElementById('appointment-date').value = appointment.date;
          document.getElementById('appointment-time').value = appointment.time;
          modalTitle.textContent = 'Edit Appointment';
          editId = id;
          errorMessage.classList.add('hidden');
          modal.classList.remove('hidden');
        });
    } else if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this appointment?')) {
        const id = parseInt(e.target.dataset.id);
        fetch(`http://localhost:8080/api/appointments/${id}`, {
          method: 'DELETE'
        })
          .then(response => {
            if (!response.ok) throw new Error('Failed to delete appointment');
            location.reload();
          })
          .catch(error => {
            console.error('Error deleting appointment:', error);
            alert('Error deleting appointment');
          });
      }
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
  });
});