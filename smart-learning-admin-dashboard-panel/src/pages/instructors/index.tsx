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
import DataTable, { InstructorRow } from './DataTable';
import {
  fetchInstructors,
  createInstructor,
  deleteInstructor,
  InstructorDoc,
} from '../../services/instructors';

/* ─── form shape ─── */
interface NewInstructorForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: NewInstructorForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};


const Instructors = () => {
  const [rows, setRows] = useState<InstructorRow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newInstructor, setNewInstructor] = useState<NewInstructorForm>(
    emptyForm
  );

  /* -------- load list once ------------------------------------------- */
  useEffect(() => {
    fetchInstructors()
      .then((list) =>
        setRows(
          list.map<InstructorRow>((inst: InstructorDoc, idx) => ({
  id: inst._id,
  num: idx + 1,
  name: `${inst.firstName} ${inst.lastName}`,
  email: inst.email,
  gender: inst.gender ?? "-",           // ⬅ Ensures string
  coursesCount: inst.courses?.length ?? 0,
  avatar: inst.image ?? "",             // ⬅ Ensures string
}))

        )
      )
      .catch(console.error);
  }, []);

  /* -------- handlers -------------------------------------------------- */
  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id)); // optimistic UI
    deleteInstructor(id).catch((err) => {
      console.error(err);
      // rollback by refetch
      fetchInstructors().then((list) =>
        setRows(
         list.map<InstructorRow>((inst: InstructorDoc, idx) => ({
  id: inst._id,
  num: idx + 1,
  name: `${inst.firstName} ${inst.lastName}`,
  email: inst.email,
  gender: inst.gender ?? "-",           // ⬅ Ensures string
  coursesCount: inst.courses?.length ?? 0,
  avatar: inst.image ?? "",             // ⬅ Ensures string
}))

        )
      );
    });
  };

const handleAddInstructor = async () => {
  try {
    const doc = await createInstructor(newInstructor); // now only has 5 fields
   setRows((prev) => [
  ...prev,
  {
    id: doc._id ?? crypto.randomUUID(), // fallback id just in case
    num: prev.length + 1,
    name: `${doc.firstName ?? ''} ${doc.lastName ?? ''}`.trim() || '-',
    email: doc.email ?? '-',
    gender: doc.gender ?? '-',
    coursesCount: doc.courses?.length ?? 0,
    avatar: doc.image ?? '',
  },
]);

    setNewInstructor(emptyForm);
    setOpenModal(false);
  } catch (err) {
    console.error(err);
    alert('Failed to add instructor');
  }
};

  /* -------- UI -------------------------------------------------------- */
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Typography variant="h6">Instructors Dashboard</Typography>

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
          Add Instructor
        </Button>
      </Stack>

      <Box mt={2}>
        <DataTable rows={rows} searchText={searchText} onDelete={handleDelete} />
      </Box>

      {/* ------------- Create Instructor Modal -------------------------- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth>
        <DialogTitle>Add Instructor</DialogTitle>

     <DialogContent dividers>
  {(
    ['firstName', 'lastName', 'email', 'password', 'confirmPassword'] as const
  ).map((field) => (
    <TextField
      key={field}
      label={field.charAt(0).toUpperCase() + field.slice(1)}
      variant="outlined"
      fullWidth
      margin="normal"
      type={field.toLowerCase().includes('password') ? 'password' : 'text'}
      value={newInstructor[field]}
      onChange={(e) =>
        setNewInstructor({ ...newInstructor, [field]: e.target.value })
      }
    />
  ))}
</DialogContent>


        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddInstructor}>Add Instructor</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Instructors;
