import  { useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridApi,
  useGridApiRef,
} from '@mui/x-data-grid';
import { Avatar, IconButton } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DeleteIcon from '@mui/icons-material/Delete';

/* --- Row shape AFTER mapping in parent --------------------------------- */
export interface CourseRow {
  id: string;           // Mongo _id (DataGrid key)
  num: number;          // sequential row number
  name: string;         // courseName
  description: string;  // courseDescription
  instructorName: string; // "First Last" or "—"
  students: number;     // studentsEnrolled.length
}

interface Props {
  rows: CourseRow[];
  searchText: string;
  onDelete?: (id: string) => void;
}

const DataTable = ({ rows, searchText, onDelete }: Props) => {
  const apiRef = useGridApiRef<GridApi>();

  /* quick filter */
  useEffect(() => {
    const words = searchText.split(/\b\W+\b/).filter(Boolean);
    apiRef.current.setQuickFilterValues(words);
  }, [searchText]);

  const columns: GridColDef<CourseRow>[] = [
    { field: 'num', headerName: '#', width: 70 },
    {
      field: 'icon',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: () => (
        <Avatar>
          <SchoolIcon fontSize="small" />
        </Avatar>
      ),
    },
    { field: 'name', headerName: 'Course', flex: 1, minWidth: 180 },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 250,
    },
    {
      field: 'instructorName',
      headerName: 'Instructor',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'students',
      headerName: 'Enrolled',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      field: 'actions',
      headerName: ' ',
      sortable: false,
      width: 90,
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
      apiRef={apiRef}
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

export default DataTable;
