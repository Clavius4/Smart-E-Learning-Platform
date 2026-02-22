import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export interface CategoryRow {
  id: string;
  num: number;
  name: string;
  description: string;
}

interface Props {
  rows: CategoryRow[];
  onDelete?: (id: string) => void;
}

const CategoryDataTable = ({ rows, onDelete }: Props) => {
  const columns: GridColDef<CategoryRow>[] = [
    { field: 'num', headerName: '#', width: 70 },
    { field: 'name', headerName: 'Category Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'actions',
      headerName: ' ',
      width: 80,
      sortable: false,
      renderCell: (params) =>
        onDelete ? (
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ) : null,
    },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      autoHeight
      rowHeight={52}
      disableRowSelectionOnClick
      pageSizeOptions={[5]}
      initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
    />
  );
};

export default CategoryDataTable;
