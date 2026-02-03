document.addEventListener('DOMContentLoaded', function() {
  const userRole = localStorage.getItem('userRole');
  if (!userRole || (userRole !== 'admin' && userRole !== 'doctor')) {
    window.location.href = 'login.html';
    return;
  }

  const patientList = document.getElementById('patient-list');

  fetch('http://localhost:8080/api/patients')
    .then(response => response.json())
    .then(patients => {
      patients.forEach(patient => {
        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-100');
        row.innerHTML = `
          <td class="p-2">${patient.name}</td>
          <td class="p-2">${patient.phone}</td>
          <td class="p-2">${patient.medicalRecord}</td>
          <td class="p-2">
            <button class="edit-btn bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600" data-id="${patient.id}">Edit</button>
            <button class="delete-btn bg-red-500 text-white p-1 rounded hover:bg-red-600 ml-2" data-id="${patient.id}">Delete</button>
          </td>
        `;
        patientList.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching patients:', error);
      alert('Error loading patients');
    });

  const modal = document.getElementById('patient-modal');
  const modalTitle = document.getElementById('modal-title');
  const patientForm = document.getElementById('patient-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const errorMessage = document.getElementById('error-message');
  let editId = null;

  document.getElementById('add-patient-btn').addEventListener('click', () => {
    modalTitle.textContent = 'Add Patient';
    patientForm.reset();
    errorMessage.classList.add('hidden');
    editId = null;
    modal.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    errorMessage.classList.add('hidden');
  });

  patientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('patient-name').value;
    const phone = document.getElementById('patient-phone').value;
    const medicalRecord = document.getElementById('patient-medical').value;

    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = 'Phone number must be in the format 123-456-7890';
      return;
    }

    const patientData = { name, phone, medicalRecord };

    if (editId) {
      fetch(`http://localhost:8080/api/patients/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to update patient');
          return response.json();
        })
        .then(() => location.reload())
        .catch(error => {
          console.error('Error updating patient:', error);
          alert('Error updating patient');
        });
    } else {
      fetch('http://localhost:8080/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add patient');
          return response.json();
        })
        .then(() => location.reload())
        .catch(error => {
          console.error('Error adding patient:', error);
          alert('Error adding patient');
        });
    }
    modal.classList.add('hidden');
  });

  patientList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const id = parseInt(e.target.dataset.id);
      fetch(`http://localhost:8080/api/patients`)
        .then(response => response.json())
        .then(patients => {
          const patient = patients.find(p => p.id === id);
          document.getElementById('patient-name').value = patient.name;
          document.getElementById('patient-phone').value = patient.phone;
          document.getElementById('patient-medical').value = patient.medicalRecord;
          modalTitle.textContent = 'Edit Patient';
          editId = id;
          errorMessage.classList.add('hidden');
          modal.classList.remove('hidden');
        });
    } else if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this patient?') && (userRole === 'admin' || userRole === 'doctor')) {
        const id = parseInt(e.target.dataset.id);
        fetch(`http://localhost:8080/api/patients/${id}`, {
          method: 'DELETE'
        })
          .then(response => {
            if (!response.ok) throw new Error('Failed to delete patient');
            location.reload();
          })
          .catch(error => {
            console.error('Error deleting patient:', error);
            alert('Error deleting patient');
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