import { useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridApi,
  useGridApiRef,
} from '@mui/x-data-grid';
import { Avatar, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

/* ─── row shape after mapping ─── */
export interface InstructorRow {
  id: string;
  num: number;
  name: string;
  email: string;
  gender: string;          // Expecting a string
  coursesCount: number;
  avatar: string;          // Expecting a string (even if fallback "")
}

interface Props {
  rows: InstructorRow[];
  searchText: string;
  onDelete?: (id: string) => void;
}

const DataTable = ({ rows, searchText, onDelete }: Props) => {
  const apiRef = useGridApiRef<GridApi>();
  const navigate = useNavigate();

  /* quick-filter every change */
  useEffect(() => {
    const words = searchText.split(/\b\W+\b/).filter(Boolean);
    apiRef.current.setQuickFilterValues(words);
  }, [searchText]);

  const columns: GridColDef<InstructorRow>[] = [
    { field: 'num', headerName: '#', width: 70 },
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: ({ row }) => (
        <Avatar src={row.avatar}>{!row.avatar && <PersonIcon fontSize="small" />}</Avatar>
      ),
    },
    { field: 'name', headerName: 'Instructor', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 210 },
    { field: 'gender', headerName: 'Gender', width: 110 },
    {
      field: 'coursesCount',
      headerName: 'Courses',
      width: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: ' ',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/instructors/${params.row.id}`)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {onDelete && (
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </>
      ),
    },
  ];

  return (

 

    <DataGrid
      apiRef={apiRef}
      rows={rows}
      columns={columns}
       getRowId={(row) => row.id ?? crypto.randomUUID()}
      autoHeight
      rowHeight={60}
      disableRowSelectionOnClick
      pageSizeOptions={[8]}
      initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
    />
  );
};

export default DataTable;
