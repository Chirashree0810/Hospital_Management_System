document.addEventListener('DOMContentLoaded', function() {
  const userRole = localStorage.getItem('userRole');
  if (!userRole) {
    window.location.href = 'login.html';
    return;
  }

  const adminControls = document.getElementById('admin-controls');
  const doctorControls = document.getElementById('doctor-controls');
  const actionsHeader = document.getElementById('actions-header');
  const doctorList = document.getElementById('doctor-list');
  let doctors = [];
  let staff = [];
  let selectedDoctorId = localStorage.getItem('selectedDoctorId');

  if (userRole === 'admin') {
    adminControls.classList.remove('hidden');
    actionsHeader.classList.remove('hidden');
  } else if (userRole === 'doctor') {
    doctorControls.classList.remove('hidden');
  } else {
    window.location.href = 'login.html';
    return;
  }

  Promise.all([
    fetch('http://localhost:8080/api/doctors').then(res => res.json()),
    fetch('http://localhost:8080/api/staff').then(res => res.json())
  ])
    .then(([doctorsData, staffData]) => {
      doctors = doctorsData;
      staff = staffData;

      if (userRole === 'doctor' && !selectedDoctorId) {
        const selectPrompt = document.createElement('div');
        selectPrompt.classList.add('mb-4');
        selectPrompt.innerHTML = `
          <label for="doctor-select" class="block text-sm font-medium text-gray-700">Select Your Profile</label>
          <select id="doctor-select" class="mt-1 w-full p-2 border rounded-lg">
            <option value="">Select a Doctor</option>
            ${doctors.map(doctor => `<option value="${doctor.id}">${doctor.name}</option>`).join('')}
          </select>
        `;
        document.querySelector('.container').insertBefore(selectPrompt, document.querySelector('.mb-4'));

        document.getElementById('doctor-select').addEventListener('change', (e) => {
          selectedDoctorId = e.target.value;
          localStorage.setItem('selectedDoctorId', selectedDoctorId);
          location.reload();
        });
        return;
      }

      let displayDoctors = doctors;
      if (userRole === 'doctor' && selectedDoctorId) {
        displayDoctors = doctors.filter(doc => doc.id === parseInt(selectedDoctorId));
      }

      displayDoctors.forEach(doctor => {
        const assignedStaff = doctor.assignedStaff && doctor.assignedStaff.length
          ? staff.filter(s => doctor.assignedStaff.includes(s.id)).map(s => s.name).join(', ')
          : 'None';
        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-100');
        row.innerHTML = `
          <td class="p-2">${doctor.name}</td>
          <td class="p-2">${doctor.specialization}</td>
          <td class="p-2">${assignedStaff}</td>
          ${userRole === 'admin' ? `
            <td class="p-2">
              <button class="edit-btn bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600" data-id="${doctor.id}">Edit</button>
              <button class="delete-btn bg-red-500 text-white p-1 rounded hover:bg-red-600 ml-2" data-id="${doctor.id}">Delete</button>
            </td>
          ` : ''}
        `;
        doctorList.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Error loading doctors');
    });

  const modal = document.getElementById('doctor-modal');
  const modalTitle = document.getElementById('modal-title');
  const doctorForm = document.getElementById('doctor-form');
  const cancelBtn = document.getElementById('cancel-btn');
  let editId = null;

  document.getElementById('add-doctor-btn')?.addEventListener('click', () => {
    modalTitle.textContent = 'Add Doctor';
    doctorForm.reset();
    editId = null;
    modal.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  doctorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('doctor-name').value;
    const specialization = document.getElementById('doctor-specialization').value;
    const doctorData = { name, specialization, assignedStaff: [] };

    if (editId) {
      fetch(`http://localhost:8080/api/doctors/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to update doctor');
          location.reload();
        })
        .catch(error => {
          console.error('Error updating doctor:', error);
          alert('Error updating doctor');
        });
    } else {
      fetch('http://localhost:8080/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add doctor');
          location.reload();
        })
        .catch(error => {
          console.error('Error adding doctor:', error);
          alert('Error adding doctor');
        });
    }
    modal.classList.add('hidden');
  });

  doctorList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const id = parseInt(e.target.dataset.id);
      fetch('http://localhost:8080/api/doctors')
        .then(response => response.json())
        .then(doctors => {
          const doctor = doctors.find(d => d.id === id);
          document.getElementById('doctor-name').value = doctor.name;
          document.getElementById('doctor-specialization').value = doctor.specialization;
          modalTitle.textContent = 'Edit Doctor';
          editId = id;
          modal.classList.remove('hidden');
        });
    } else if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this doctor?')) {
        const id = parseInt(e.target.dataset.id);
        fetch(`http://localhost:8080/api/doctors/${id}`, {
          method: 'DELETE'
        })
          .then(response => {
            if (!response.ok) throw new Error('Failed to delete doctor');
            location.reload();
          })
          .catch(error => {
            console.error('Error deleting doctor:', error);
            alert('Error deleting doctor');
          });
      }
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('selectedDoctorId');
    window.location.href = 'login.html';
  });
});