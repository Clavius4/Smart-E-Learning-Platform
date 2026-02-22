import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CategoryDataTable, { CategoryRow } from './DataTable';
import { fetchCategories, createCategory, deleteCategory } from '../../services/categories';

interface NewCategoryForm {
  name: string;
  description: string;
}

const emptyForm: NewCategoryForm = {
  name: '',
  description: '',
};

const Categories = () => {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategoryForm>(emptyForm);

  useEffect(() => {
    fetchCategories()
      .then((list) =>
        setRows(
          list.map((cat, idx) => ({
            id: cat._id,
            num: idx + 1,
            name: cat.name,
            description: cat.description,
          }))
        )
      )
      .catch(console.error);
  }, []);

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    deleteCategory(id).catch((err) => {
      console.error(err);
    });
  };

  const handleAddCategory = async () => {
    try {
      const doc = await createCategory(newCategory);
      setRows((prev) => [
        ...prev,
        {
          id: doc._id,
          num: prev.length + 1,
          name: doc.name,
          description: doc.description,
        },
      ]);
      setNewCategory(emptyForm);
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6">Categories Dashboard</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          Add Category
        </Button>
      </Stack>

      <Box mt={2}>
        <CategoryDataTable rows={rows} onDelete={handleDelete} />
      </Box>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Category Name"
            fullWidth
            margin="normal"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleAddCategory}>Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Categories;
