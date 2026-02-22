import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { InstructorDoc, fetchInstructors } from '../../services/instructors';

const InstructorDetails = () => {
  const { id } = useParams();
  const [inst, setInst] = useState<InstructorDoc | null>(null);

  useEffect(() => {
    fetchInstructors()
      .then((list) => setInst(list.find((i) => i._id === id) || null))
      .catch(console.error);
  }, [id]);

  if (!inst) {
    return (
      <Box p={4}>
        <Typography variant="h6">Instructor not found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      p={2}
    >
      <Card sx={{ maxWidth: 480, width: '100%', p: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar src={inst.image} sx={{ width: 56, height: 56 }}>
              {!inst.image && <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {inst.firstName} {inst.lastName}
              </Typography>
              <Typography color="text.secondary">{inst.email}</Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            {/* <Typography>
              <strong>Gender:</strong> {inst.gender}
            </Typography> */}
            <Typography>
              <strong>Total Courses:</strong> {inst.courses?.length ?? 0}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InstructorDetails;
