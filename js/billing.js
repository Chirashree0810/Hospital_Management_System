document.addEventListener('DOMContentLoaded', function() {
  const userRole = localStorage.getItem('userRole');
  if (!userRole || userRole !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  const billingList = document.getElementById('billing-list');
  const patientSelect = document.getElementById('patient-id');
  let billing = [];
  let patients = [];

  Promise.all([
    fetch('http://localhost:8080/api/billing').then(res => res.json()),
    fetch('http://localhost:8080/api/patients').then(res => res.json())
  ])
    .then(([billingData, patientsData]) => {
      billing = billingData;
      patients = patientsData;

      patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = patient.name;
        patientSelect.appendChild(option);
      });

      billing.forEach(record => {
        const patient = patients.find(p => p.id === record.patientId);
        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-100');
        row.innerHTML = `
          <td class="p-2">${patient ? patient.name : 'Unknown'}</td>
          <td class="p-2">${record.amount.toFixed(2)}</td>
          <td class="p-2">${record.description}</td>
          <td class="p-2">${record.date}</td>
          <td class="p-2">
            <button class="edit-btn bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600" data-id="${record.id}">Edit</button>
            <button class="delete-btn bg-red-500 text-white p-1 rounded hover:bg-red-600 ml-2" data-id="${record.id}">Delete</button>
          </td>
        `;
        billingList.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Error loading billing records');
    });

  const modal = document.getElementById('billing-modal');
  const modalTitle = document.getElementById('modal-title');
  const billingForm = document.getElementById('billing-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const errorMessage = document.getElementById('error-message');
  let editId = null;

  document.getElementById('add-billing-btn').addEventListener('click', () => {
    modalTitle.textContent = 'Add Billing Record';
    billingForm.reset();
    errorMessage.classList.add('hidden');
    document.getElementById('billing-date').value = '2025-05-20';
    editId = null;
    modal.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    errorMessage.classList.add('hidden');
  });

  billingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const patientId = parseInt(document.getElementById('patient-id').value);
    const amount = parseFloat(document.getElementById('billing-amount').value);
    const description = document.getElementById('billing-description').value;
    const date = document.getElementById('billing-date').value;

    const selectedDate = new Date(date);
    const today = new Date('2025-05-20');
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = 'Date cannot be in the future';
      return;
    }

    if (amount <= 0) {
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = 'Amount must be greater than 0';
      return;
    }

    const billingData = { patientId, amount, description, date };

    if (editId) {
      fetch(`http://localhost:8080/api/billing/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to update billing record');
          location.reload();
        })
        .catch(error => {
          console.error('Error updating billing record:', error);
          alert('Error updating billing record');
        });
    } else {
      fetch('http://localhost:8080/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingData)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add billing record');
          location.reload();
        })
        .catch(error => {
          console.error('Error adding billing record:', error);
          alert('Error adding billing record');
        });
    }
    modal.classList.add('hidden');
  });

  billingList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const id = parseInt(e.target.dataset.id);
      fetch('http://localhost:8080/api/billing')
        .then(response => response.json())
        .then(billing => {
          const record = billing.find(b => b.id === id);
          document.getElementById('patient-id').value = record.patientId;
          document.getElementById('billing-amount').value = record.amount;
          document.getElementById('billing-description').value = record.description;
          document.getElementById('billing-date').value = record.date;
          modalTitle.textContent = 'Edit Billing Record';
          editId = id;
          errorMessage.classList.add('hidden');
          modal.classList.remove('hidden');
        });
    } else if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this billing record?')) {
        const id = parseInt(e.target.dataset.id);
        fetch(`http://localhost:8080/api/billing/${id}`, {
          method: 'DELETE'
        })
          .then(response => {
            if (!response.ok) throw new Error('Failed to delete billing record');
            location.reload();
          })
          .catch(error => {
            console.error('Error deleting billing record:', error);
            alert('Error deleting billing record');
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