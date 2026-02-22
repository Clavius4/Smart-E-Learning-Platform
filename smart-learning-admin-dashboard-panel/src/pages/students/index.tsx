import { useEffect, useState, ChangeEvent } from 'react';
import {
  Box,
  Stack,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import DataTable, { StudentRow } from './DataTable';
import {
  fetchStudents,
  createStudent,
  deleteStudent,
  StudentDoc,
} from '../../services/students';

/* ─── form shape ─── */
interface NewStudentForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: NewStudentForm = {
   firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const Students = () => {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudentForm>(emptyForm);

  /* -------- load from API ------------------------------------------- */
  useEffect(() => {
    fetchStudents()
      .then((list) =>
        setRows(
          list.map((s, idx) => ({
            id: s._id,
            num: idx + 1,
            name: `${s.firstName} ${s.lastName}`,
            grade: s.grade ?? "_",
            email: s.email,
            gender: s.gender ?? "-",
            avatar: s.image  ?? "",
          }))
      )
      )
      .catch(console.error);
  }, []);

  /* -------- handlers ------------------------------------------------- */
  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id)); // optimistic
    deleteStudent(id).catch((err) => {
      console.error(err);
      // rollback by refetch
      fetchStudents().then((list) =>
        setRows(
          list.map((s:StudentDoc, idx) => ({
            id: s._id,
            num: idx + 1,
            name: `${s.firstName} ${s.lastName}`,
            grade: s.grade ?? "-",
            email: s.email,
            gender: s.gender ?? "-",
            avatar: s.image  ?? "",
          }))
        )
      );
    });
  };

  const handleAddStudent = async () => {
    try {
      const doc = await createStudent(newStudent);
      setRows((prev) => [
        ...prev,
        {
          id: doc._id,
          num: prev.length + 1,
          name: `${doc.firstName ?? ""} ${doc.lastName?? ""}`,
          grade: doc.grade ?? "-",
          email: doc.email ?? "-",
          gender: doc.gender ?? "-",
          avatar: doc.image ?? "-",
        },
      ]);
      setNewStudent(emptyForm);
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add student');
    }
  };

  /* -------- UI ------------------------------------------------------- */
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Typography variant="h6">Students Dashboard</Typography>

        <TextField
          variant="filled"
          size="small"
          placeholder="Search…"
          value={searchText}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchText(e.target.value)
          }
          sx={{ maxWidth: 260 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconifyIcon icon="prime:search" />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Add Student
        </Button>
      </Stack>

      <Box mt={2}>
        <DataTable rows={rows} searchText={searchText} onDelete={handleDelete} />
      </Box>

      {/* ------------- Modal ------------------------------------------- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth>
        <DialogTitle>Add Student</DialogTitle>

        <DialogContent dividers>
          {(
             ['firstName', 'lastName', 'email', 'password', 'confirmPassword']as const
          ).map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              variant="outlined"
              fullWidth
              margin="normal"
              type={field === 'password' ? 'password' : 'text'}
              value={newStudent[field]}
              onChange={(e) =>
                setNewStudent({ ...newStudent, [field]: e.target.value })
              }
            />
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddStudent}>Add Student</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Students;
