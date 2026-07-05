import TopCard from './TopCard';
import { topCardsData, TopCard as TopCardData } from 'data/topCardsData';
import { useEffect, useState } from 'react';

import { DashboardStats } from 'types/dashboard';
import { Grid } from '@mui/material';

const TopCards = ({ stats }: { stats?: DashboardStats }) => {
  const [cards, setCards] = useState<TopCardData[]>(topCardsData);

  useEffect(() => {
    if (stats) {
      setCards((prev: TopCardData[]) => prev.map((card: TopCardData) => {
        if (card.title === 'Total Instructors') return { ...card, count: stats.totalInstructors };
        if (card.title === 'Total Students') return { ...card, count: stats.totalStudents };
        if (card.title === 'Courses Available') return { ...card, count: stats.totalCourses };
        return card;
      }));
    }
  }, [stats]);

  return (
    <Grid container spacing={4.75}>
      {cards.map((item) => (
        <Grid item key={item.id} xs={12} sm={6} lg={3}>
          <TopCard data={item} />
        </Grid>
      ))}
    </Grid>
  );
};

export default TopCards;
