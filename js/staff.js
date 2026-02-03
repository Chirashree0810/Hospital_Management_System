document.addEventListener('DOMContentLoaded', function() {
  const userRole = localStorage.getItem('userRole');
  if (!userRole || (userRole !== 'admin' && userRole !== 'staff')) {
    window.location.href = 'login.html';
    return;
  }

  const staffList = document.getElementById('staff-list');
  const adminControls = document.getElementById('admin-controls');
  const actionsHeader = document.getElementById('actions-header');
  let staff = [];
  let doctors = [];

  // Show admin controls if the user is an admin
  if (userRole === 'admin') {
    adminControls.classList.remove('hidden');
    actionsHeader.classList.remove('hidden');
  }

  // Fetch staff and doctors from the backend
  Promise.all([
    fetch('http://localhost:8080/api/staff').then(res => res.json()),
    fetch('http://localhost:8080/api/doctors').then(res => res.json())
  ])
    .then(([staffData, doctorsData]) => {
      staff = staffData;
      doctors = doctorsData;

      // Filter staff for non-admin users (staff role sees only their own info)
      let displayStaff = staff;
      if (userRole === 'staff') {
        const username = localStorage.getItem('username');
        displayStaff = staff.filter(s => s.name.toLowerCase() === username.toLowerCase());
        if (displayStaff.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = `<td colspan="2" class="p-2 text-center">No staff profile found for ${username}</td>`;
          staffList.appendChild(row);
          return;
        }
      }

      // Populate the staff list
      displayStaff.forEach(staffMember => {
        const doctor = doctors.find(doc => doc.id === staffMember.assignedDoctorId);
        const doctorName = doctor ? doctor.name : 'Not Assigned';
        const row = document.createElement('tr');
        row.classList.add('border-b', 'hover:bg-gray-100');
        row.innerHTML = `
          <td class="p-2">${staffMember.name}</td>
          <td class="p-2">${doctorName}</td>
          ${userRole === 'admin' ? `
            <td class="p-2">
              <button class="edit-btn bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600" data-id="${staffMember.id}">Edit</button>
              <button class="delete-btn bg-red-500 text-white p-1 rounded hover:bg-red-600 ml-2" data-id="${staffMember.id}">Delete</button>
            </td>
          ` : ''}
        `;
        staffList.appendChild(row);
      });

      // Populate doctor options for the add/edit form (for admins)
      if (userRole === 'admin') {
        const doctorSelect = document.getElementById('doctor-id');
        doctors.forEach(doctor => {
          const option = document.createElement('option');
          option.value = doctor.id;
          option.textContent = doctor.name;
          doctorSelect.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Error loading staff data');
    });

  // Modal handling for Add/Edit (for admins only)
  if (userRole === 'admin') {
    const modal = document.getElementById('staff-modal');
    const modalTitle = document.getElementById('modal-title');
    const staffForm = document.getElementById('staff-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const errorMessage = document.getElementById('error-message');
    let editId = null;

    document.getElementById('add-staff-btn').addEventListener('click', () => {
      modalTitle.textContent = 'Add Staff';
      staffForm.reset();
      errorMessage.classList.add('hidden');
      editId = null;
      modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      errorMessage.classList.add('hidden');
    });

    staffForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('staff-name').value;
      const assignedDoctorId = parseInt(document.getElementById('doctor-id').value) || null;
      const staffData = { name, assignedDoctorId };

      if (editId) {
        fetch(`http://localhost:8080/api/staff/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
        })
          .then(response => {
            if (!response.ok) throw new Error('Failed to update staff');
            location.reload();
          })
          .catch(error => {
            console.error('Error updating staff:', error);
            alert('Error updating staff');
          });
      } else {
        fetch('http://localhost:8080/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
        })
          .then(response => {
            if (!response.ok) throw new Error('Failed to add staff');
            location.reload();
          })
          .catch(error => {
            console.error('Error adding staff:', error);
            alert('Error adding staff');
          });
      }
      modal.classList.add('hidden');
    });

    // Edit and Delete
    staffList.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-btn')) {
        const id = parseInt(e.target.dataset.id);
        fetch('http://localhost:8080/api/staff')
          .then(response => response.json())
          .then(staff => {
            const staffMember = staff.find(s => s.id === id);
            document.getElementById('staff-name').value = staffMember.name;
            document.getElementById('doctor-id').value = staffMember.assignedDoctorId || '';
            modalTitle.textContent = 'Edit Staff';
            editId = id;
            errorMessage.classList.add('hidden');
            modal.classList.remove('hidden');
          });
      } else if (e.target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this staff member?')) {
          const id = parseInt(e.target.dataset.id);
          fetch(`http://localhost:8080/api/staff/${id}`, {
            method: 'DELETE'
          })
            .then(response => {
              if (!response.ok) throw new Error('Failed to delete staff');
              location.reload();
            })
            .catch(error => {
              console.error('Error deleting staff:', error);
              alert('Error deleting staff');
            });
        }
      }
    });
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
  });
});