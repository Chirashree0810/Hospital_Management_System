const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 8080;

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Serve static files from the parent directory (HMS_DB)
app.use(express.static(path.join(__dirname, '..')));

// Path to data.json
const dataFilePath = path.join(__dirname, '../data.json');

// Helper function to read data.json
async function readData() {
  const data = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write to data.json
async function writeData(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error reading data' });
  }
});

// CRUD for Patients
app.get('/api/patients', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.patients);
  } catch (error) {
    res.status(500).json({ error: 'Error reading patients' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const data = await readData();
    const newPatient = req.body;
    newPatient.id = data.patients.length ? Math.max(...data.patients.map(p => p.id)) + 1 : 1;
    data.patients.push(newPatient);
    await writeData(data);
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ error: 'Error adding patient' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const updatedPatient = req.body;
    const index = data.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      data.patients[index] = { ...data.patients[index], ...updatedPatient };
      await writeData(data);
      res.json(data.patients[index]);
    } else {
      res.status(404).json({ error: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating patient' });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    data.patients = data.patients.filter(p => p.id !== id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting patient' });
  }
});

// CRUD for Doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.doctors);
  } catch (error) {
    res.status(500).json({ error: 'Error reading doctors' });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const data = await readData();
    const newDoctor = req.body;
    newDoctor.id = data.doctors.length ? Math.max(...data.doctors.map(d => d.id)) + 1 : 1;
    data.doctors.push(newDoctor);
    await writeData(data);
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ error: 'Error adding doctor' });
  }
});

app.put('/api/doctors/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const updatedDoctor = req.body;
    const index = data.doctors.findIndex(d => d.id === id);
    if (index !== -1) {
      data.doctors[index] = { ...data.doctors[index], ...updatedDoctor };
      await writeData(data);
      res.json(data.doctors[index]);
    } else {
      res.status(404).json({ error: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating doctor' });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    data.doctors = data.doctors.filter(d => d.id !== id);
    // Remove the doctor from any staff assignments
    data.staff = data.staff.map(s => {
      if (s.assignedDoctorId === id) {
        return { ...s, assignedDoctorId: null };
      }
      return s;
    });
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting doctor' });
  }
});

// CRUD for Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error reading appointments' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const data = await readData();
    const newAppointment = req.body;
    newAppointment.id = data.appointments.length ? Math.max(...data.appointments.map(a => a.id)) + 1 : 1;
    data.appointments.push(newAppointment);
    await writeData(data);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Error adding appointment' });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const updatedAppointment = req.body;
    const index = data.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      data.appointments[index] = { ...data.appointments[index], ...updatedAppointment };
      await writeData(data);
      res.json(data.appointments[index]);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    data.appointments = data.appointments.filter(a => a.id !== id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

// CRUD for Billing
app.get('/api/billing', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.billing);
  } catch (error) {
    res.status(500).json({ error: 'Error reading billing' });
  }
});

app.post('/api/billing', async (req, res) => {
  try {
    const data = await readData();
    const newBilling = req.body;
    newBilling.id = data.billing.length ? Math.max(...data.billing.map(b => b.id)) + 1 : 1;
    data.billing.push(newBilling);
    await writeData(data);
    res.status(201).json(newBilling);
  } catch (error) {
    res.status(500).json({ error: 'Error adding billing record' });
  }
});

app.put('/api/billing/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const updatedBilling = req.body;
    const index = data.billing.findIndex(b => b.id === id);
    if (index !== -1) {
      data.billing[index] = { ...data.billing[index], ...updatedBilling };
      await writeData(data);
      res.json(data.billing[index]);
    } else {
      res.status(404).json({ error: 'Billing record not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating billing record' });
  }
});

app.delete('/api/billing/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    data.billing = data.billing.filter(b => b.id !== id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting billing record' });
  }
});

// CRUD for Staff
app.get('/api/staff', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.staff);
  } catch (error) {
    res.status(500).json({ error: 'Error reading staff' });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const data = await readData();
    const newStaff = req.body;
    newStaff.id = data.staff.length ? Math.max(...data.staff.map(s => s.id)) + 1 : 1;
    data.staff.push(newStaff);

    // Update the doctor's assignedStaff array
    if (newStaff.assignedDoctorId) {
      const doctor = data.doctors.find(d => d.id === newStaff.assignedDoctorId);
      if (doctor) {
        if (!doctor.assignedStaff) doctor.assignedStaff = [];
        if (!doctor.assignedStaff.includes(newStaff.id)) {
          doctor.assignedStaff.push(newStaff.id);
        }
      }
    }

    await writeData(data);
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(500).json({ error: 'Error adding staff' });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const updatedStaff = req.body;
    const index = data.staff.findIndex(s => s.id === id);
    if (index !== -1) {
      const oldStaff = data.staff[index];
      data.staff[index] = { ...oldStaff, ...updatedStaff };

      // Update the doctor's assignedStaff array
      // Remove the staff from the old doctor's assignedStaff
      if (oldStaff.assignedDoctorId) {
        const oldDoctor = data.doctors.find(d => d.id === oldStaff.assignedDoctorId);
        if (oldDoctor && oldDoctor.assignedStaff) {
          oldDoctor.assignedStaff = oldDoctor.assignedStaff.filter(staffId => staffId !== id);
        }
      }

      // Add the staff to the new doctor's assignedStaff
      if (updatedStaff.assignedDoctorId) {
        const newDoctor = data.doctors.find(d => d.id === updatedStaff.assignedDoctorId);
        if (newDoctor) {
          if (!newDoctor.assignedStaff) newDoctor.assignedStaff = [];
          if (!newDoctor.assignedStaff.includes(id)) {
            newDoctor.assignedStaff.push(id);
          }
        }
      }

      await writeData(data);
      res.json(data.staff[index]);
    } else {
      res.status(404).json({ error: 'Staff not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating staff' });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);
    const staffMember = data.staff.find(s => s.id === id);
    if (staffMember) {
      // Remove the staff from the doctor's assignedStaff
      if (staffMember.assignedDoctorId) {
        const doctor = data.doctors.find(d => d.id === staffMember.assignedDoctorId);
        if (doctor && doctor.assignedStaff) {
          doctor.assignedStaff = doctor.assignedStaff.filter(staffId => staffId !== id);
        }
      }
    }
    data.staff = data.staff.filter(s => s.id !== id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting staff' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});