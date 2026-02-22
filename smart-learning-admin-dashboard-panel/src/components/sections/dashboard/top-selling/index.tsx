import { TrendingCourse } from 'types/dashboard';
import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ActionMenu from 'components/common/ActionMenu';
import ProductCard from './ProductCard';

const actions = [
  {
    id: 1,
    icon: 'mage:refresh',
    title: 'Refresh',
  },
  {
    id: 2,
    icon: 'mage:eye',
    title: 'View All',
  },
  {
    id: 3,
    icon: 'mage:share',
    title: 'Share',
  },
];

const TopSelling = ({ data }: { data?: TrendingCourse[] }) => {
  return (
    <Paper sx={{ height: 370 }}>
      <Stack mt={-0.5} alignItems="center" justifyContent="space-between">
        <Typography variant="h6" color="text.secondary">
          Top Trending Courses
        </Typography>

        <ActionMenu actions={actions} />
      </Stack>

      <Box mt={3}>
        {data && data.slice(0, 2).map((item, index) => (
          <React.Fragment key={item._id}>
            <ProductCard data={{
              id: item._id,
              title: item.courseName, // Mapped from courseName to title
              price: item.price ? `$${item.price}` : 'Free',
              rating: 4.5, // placeholder
              image: item.thumbnail || '',
              link: '#!'
            }} />
            {index !== 1 && <Divider />}
          </React.Fragment>
        ))}
        {!data && <Typography variant="body2" sx={{ p: 2 }}>No trending courses</Typography>}
      </Box>
    </Paper>
  );
};

export default TopSelling;
