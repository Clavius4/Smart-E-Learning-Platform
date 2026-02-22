import Grid from '@mui/material/Grid';
// import Typography from '@mui/material/Typography';
import Analytics from 'components/sections/dashboard/analytics';
import RecentOrders from 'components/sections/dashboard/recent-orders';
import Reports from 'components/sections/dashboard/reports';
import TopCards from 'components/sections/dashboard/top-cards';
import TopSelling from 'components/sections/dashboard/top-selling';
import { useEffect, useState } from 'react';
import { DashboardStats } from 'types/dashboard';
import api from 'services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard-stats')
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.data);
          console.log("Dashboard Stats Loaded:", res.data.data);
        } else {
          setError("Failed to load data: " + (res.data.message || "Unknown error"));
        }
      })
      .catch(err => {
        console.error("Failed to fetch dashboard stats", err);
        setError("Network error or server unreachable. Check console.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Dashboard...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!stats) return <div style={{ padding: 40, textAlign: 'center' }}>No data available.</div>;

  return (
    <Grid container px={3.75} spacing={3.75}>
      <Grid item xs={12}>
        <TopCards stats={stats} />
      </Grid>
      <Grid item xs={12} md={7}>
        <Reports data={stats.signupStats} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Analytics data={stats.categoryStats} />
      </Grid>
      <Grid item xs={12} md={7}>
        <RecentOrders data={stats.recentCourses} />
      </Grid>
      <Grid item xs={12} md={5}>
        <TopSelling data={stats.trendingCourses} />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
