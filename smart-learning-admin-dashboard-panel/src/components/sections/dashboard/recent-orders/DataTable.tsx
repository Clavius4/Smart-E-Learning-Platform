import { useEffect } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, useGridApiRef, GridApi } from '@mui/x-data-grid';
import DataGridFooter from 'components/common/DataGridFooter';
import ActionMenu from 'components/common/ActionMenu';
//import Image from 'components/base/Image';
//import { formatNumber } from 'helpers/formatNumber';
// import { rows } from 'data/recentOrdersData';

const actions = [
  {
    id: 1,
    icon: 'mage:refresh',
    title: 'Refresh',
  },
  {
    id: 2,
    icon: 'solar:export-linear',
    title: 'Export',
  },
  {
    id: 3,
    icon: 'mage:share',
    title: 'Share',
  },
];

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Tracking no',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 120,
    renderCell: (params) => <Typography variant="caption">{params.row._id}</Typography>
  },
  {
    field: 'courseName',
    headerName: 'Course Name',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 220,
    renderCell: (params) => (
      <Stack height={1} spacing={1.5} alignItems="center" justifyContent="flex-start">
        <Typography variant="caption" fontWeight={600}>
          {params.value}
        </Typography>
      </Stack>
    ),
  },
  {
    field: 'instructor',
    headerName: 'Instructor Name',
    editable: false,
    align: 'left',
    flex: 2,
    minWidth: 140,
    renderCell: (params) => (
      <Typography variant="caption">
        {params.value ? `${params.value.firstName} ${params.value.lastName}` : 'Unassigned'}
      </Typography>
    )
  },
  {
    field: 'studentsEnrolled',
    headerName: 'Students Enrolled',
    editable: false,
    headerAlign: 'left',
    align: 'left',
    flex: 2,
    minWidth: 140,
    renderCell: (params) => (
      <Stack direction="column" alignItems="flex-start" justifyContent="center" height={1}>
        <Chip label={Array.isArray(params.value) ? params.value.length : 0} size="small" color="secondary" sx={{ borderRadius: 1.75 }} />
      </Stack>
    ),
  },
  {
    field: 'level',
    headerName: 'Level',
    headerAlign: 'left',
    align: 'left',
    editable: false,
    flex: 1,
    minWidth: 140,
    renderCell: (params) => (
      <Stack direction="column" alignItems="flex-start" justifyContent="center" height={1}>
        <Chip label={params.value} size="small" color="warning" sx={{ borderRadius: 1.75 }} />
      </Stack>
    ),
  },
  {
    field: 'action',
    headerAlign: 'right',
    align: 'right',
    editable: false,
    sortable: false,
    flex: 1,
    minWidth: 100,
    renderHeader: () => <ActionMenu actions={actions} />,
    renderCell: () => <ActionMenu actions={actions} />,
  },
];

import { RecentOrderRow } from 'types/dashboard';

interface TaskOverviewTableProps {
  searchText: string;
  rows?: RecentOrderRow[];
}

const DataTable = ({ searchText, rows: dataRows }: TaskOverviewTableProps) => {
  const apiRef = useGridApiRef<GridApi>();

  useEffect(() => {
    apiRef.current.setQuickFilterValues(searchText.split(/\b\W+\b/).filter((word) => word !== ''));
  }, [searchText]);

  return (
    <DataGrid
      apiRef={apiRef}
      density="standard"
      columns={columns}
      rows={dataRows || []}
      getRowId={(row) => row._id || row.id}
      rowHeight={50}
      disableColumnResize
      disableColumnMenu
      disableColumnSelector
      disableRowSelectionOnClick
      initialState={{
        pagination: { paginationModel: { pageSize: 4 } },
      }}
      autosizeOptions={{
        includeOutliers: true,
        includeHeaders: false,
        outliersFactor: 1,
        expand: true,
      }}
      slots={{
        pagination: DataGridFooter,
      }}
      checkboxSelection
      pageSizeOptions={[4]}
    />
  );
};

export default DataTable;
