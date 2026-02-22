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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import DataTable, { CourseRow } from './DataTable';
import {
  fetchCourses,
  createCourse,
  deleteCourse,
  CourseDoc,
} from '../../services/courses';
import { fetchInstructors, InstructorDoc } from '../../services/instructors';

/* ---- simple add-course form (adapt if your API requires more) ---------- */
interface NewCourseForm {
  courseName: string;
  courseDescription: string;
  instructorId: string;
}

const emptyForm: NewCourseForm = {
  courseName: '',
  courseDescription: '',
  instructorId: '',
};

const Courses = () => {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseForm>(emptyForm);
  const [instructors, setInstructors] = useState<InstructorDoc[]>([]);

  /* ---------- load once ------------------------------------------------- */
  useEffect(() => {
    fetchCourses()
      .then((list) =>
        setRows(
          list.map<CourseRow>((c: CourseDoc, idx) => ({
            id: c._id,
            num: idx + 1,
            name: c.courseName,
            description: c.courseDescription,
            instructorName: c.instructor
              ? `${c.instructor.firstName} ${c.instructor.lastName}`
              : '—',
            students: c.studentsEnrolled.length,
          }))
        )
      )
      .catch(console.error);

    // fetch instructors for dropdown
    fetchInstructors().then(setInstructors).catch(console.error);
  }, []);

  /* ---------- handlers -------------------------------------------------- */
  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id)); // optimistic
    deleteCourse(id).catch((err) => {
      console.error(err);
      /* fallback – refetch list */
      fetchCourses().then((list) =>
        setRows(
          list.map((c, idx) => ({
            id: c._id,
            num: idx + 1,
            name: c.courseName,
            description: c.courseDescription,
            instructorName: c.instructor
              ? `${c.instructor.firstName} ${c.instructor.lastName}`
              : '—',
            students: c.studentsEnrolled.length,
          }))
        )
      );
    });
  };

  const handleAddCourse = async () => {
    try {
      const doc = await createCourse(newCourse);
      const instructor = instructors.find(i => i._id === newCourse.instructorId);

      setRows((prev) => [
        ...prev,
        {
          id: doc._id,
          num: prev.length + 1,
          name: doc.courseName,
          description: doc.courseDescription,
          instructorName: instructor
            ? `${instructor.firstName} ${instructor.lastName}`
            : '—',
          students: doc.studentsEnrolled.length,
        },
      ]);
      setNewCourse(emptyForm);
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add course');
    }
  };

  /* ---------- UI -------------------------------------------------------- */
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Typography variant="h6">Courses Dashboard</Typography>

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
          Add Course
        </Button>
      </Stack>

      <Box mt={2}>
        <DataTable
          rows={rows}
          searchText={searchText}
          onDelete={handleDelete}
        />
      </Box>

      {/* ------------- Modal --------------------------------------------- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth>
        <DialogTitle>Add Course</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Course Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newCourse.courseName}
            onChange={(e) =>
              setNewCourse({ ...newCourse, courseName: e.target.value })
            }
          />
          <TextField
            label="Course Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newCourse.courseDescription}
            onChange={(e) =>
              setNewCourse({
                ...newCourse,
                courseDescription: e.target.value,
              })
            }
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="instructor-select-label">Assign Instructor</InputLabel>
            <Select
              labelId="instructor-select-label"
              value={newCourse.instructorId}
              label="Assign Instructor"
              onChange={(e: SelectChangeEvent) =>
                setNewCourse({ ...newCourse, instructorId: e.target.value })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {instructors.map((inst) => (
                <MenuItem key={inst._id} value={inst._id}>
                  {inst.firstName} {inst.lastName} ({inst.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddCourse} disabled={!newCourse.instructorId || !newCourse.courseName}>
            Add Course
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Courses;
