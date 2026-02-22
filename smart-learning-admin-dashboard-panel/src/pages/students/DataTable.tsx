import  { useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridApi,
  useGridApiRef,
} from '@mui/x-data-grid';
import { Avatar, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';

/* ─── row shape after mapping ─── */
export interface StudentRow {
  id: string;       // Mongo _id
  num: number;      // 1-based index
  name: string;     // “First Last”
  grade: string;
  email: string;
  gender: string;
  avatar?: string;
}

interface Props {
  rows: StudentRow[];
  searchText: string;
  onDelete?: (id: string) => void;
}

const DataTable = ({ rows, searchText, onDelete }: Props) => {
  const apiRef = useGridApiRef<GridApi>();

  /* quick-filter on search change */
  useEffect(() => {
    const words = searchText.split(/\b\W+\b/).filter(Boolean);
    apiRef.current.setQuickFilterValues(words);
  }, [searchText]);

  const columns: GridColDef<StudentRow>[] = [
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
    { field: 'name', headerName: 'Student', flex: 1, minWidth: 160 },
    { field: 'grade', headerName: 'Class', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'gender', headerName: 'Gender', width: 110 },
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
      getRowId={(row) => row.id ?? crypto.randomUUID()}
      autoHeight
      rowHeight={52}
      disableRowSelectionOnClick
      pageSizeOptions={[8]}
      initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
    />
  );
};

export default DataTable;
