import ActionMenu from 'components/common/ActionMenu';
import AnalyticsChart from './AnalyticsChart';

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

import { CategoryStat } from 'types/dashboard';
import { Stack, Paper, Typography } from '@mui/material';

const Analytics = ({ data }: { data?: CategoryStat[] }) => {
  const chartData = data ? data.map((item, index) => ({
    id: index,
    value: item.count,
    name: item._id
  })) : [];

  return (
    <Paper sx={{ px: 0, height: 410 }}>
      <Stack mt={-0.5} px={3.75} alignItems="center" justifyContent="space-between">
        <Typography variant="h6" color="text.secondary" zIndex={1000}>
          Analytics
        </Typography>

        <ActionMenu actions={actions} />
      </Stack>

      <AnalyticsChart data={chartData} sx={{ mt: -5.5, mx: 'auto', width: 300, height: '370px !important' }} />
    </Paper>
  );
};

export default Analytics;
