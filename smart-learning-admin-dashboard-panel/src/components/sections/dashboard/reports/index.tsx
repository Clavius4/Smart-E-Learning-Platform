import ReportsChart from './ReportsChart';
import ActionMenu from 'components/common/ActionMenu';

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

import { SignupStat } from 'types/dashboard';
import { Stack, Paper, Typography } from '@mui/material';

const Reports = ({ data }: { data?: SignupStat[] }) => {
  // If data is provided (e.g., from backend as signup stats), transform it to array of numbers if Chart expects that.
  // The current static data is [156, 132...]. 
  // Our backend sends array of objects {_id: {year, month}, count: number}.
  // We need to map this to a simple array of counts for the last 12 months, or just pass counts.

  const chartData = data ? data.map(d => d.count) : [];

  return (
    <Paper sx={{ pr: 0, height: 410 }}>
      <Stack mt={-0.5} pr={3.5} alignItems="center" justifyContent="space-between">
        <Typography variant="h6" color="text.secondary">
          Reports
        </Typography>

        <ActionMenu actions={actions} />
      </Stack>

      <ReportsChart
        data={chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
        sx={{ height: '320px !important' }}
      />
    </Paper>
  );
};

export default Reports;
