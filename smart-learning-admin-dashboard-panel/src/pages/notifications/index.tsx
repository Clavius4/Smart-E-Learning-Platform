import { useEffect, useState } from 'react';
import Loader from 'components/common/Loader';
import { NotificationItem } from 'services/notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Alert, IconButton, Chip, Badge, Stack, Fade, Grow, Zoom, alpha, useTheme } from '@mui/material';


interface ActionDetail {
  label: string;
  icon: string;
  muiIcon: React.ElementType;
  color: string;
  bg: string;
  gradient: string;
}

// Enhanced notification details with relevant e-learning actions
const getActionDetails = (action: string) => {
  const actionMap: Record<string, ActionDetail> = {
    // Student actions
    'student_signup': { 
      label: 'New Student Joined', 
      icon: 'solar:user-plus-bold', 
      muiIcon: PersonAddIcon,
      color: '#4caf50', 
      bg: 'rgba(76, 175, 80, 0.1)',
      gradient: 'linear-gradient(135deg, #4caf50, #45a049)',
    },
    'instructor_signup': { 
      label: 'New Instructor Registered', 
      icon: 'solar:user-plus-bold', 
      muiIcon: SchoolIcon,
      color: '#2196f3', 
      bg: 'rgba(33, 150, 243, 0.1)',
      gradient: 'linear-gradient(135deg, #2196f3, #1976d2)',
    },
    'course_enroll': { 
      label: 'Student Enrolled', 
      icon: 'solar:bookmark-bold', 
      muiIcon: BookIcon,
      color: '#ff9800', 
      bg: 'rgba(255, 152, 0, 0.1)',
      gradient: 'linear-gradient(135deg, #ff9800, #f57c00)',
    },
    'course_complete': { 
      label: 'Course Completed', 
      icon: 'solar:cup-star-bold', 
      muiIcon: EmojiEventsIcon,
      color: '#9c27b0', 
      bg: 'rgba(156, 39, 176, 0.1)',
      gradient: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
    },
    'quiz_submit': { 
      label: 'Quiz Submitted', 
      icon: 'solar:checklist-bold', 
      muiIcon: AssignmentIcon,
      color: '#00bcd4', 
      bg: 'rgba(0, 188, 212, 0.1)',
      gradient: 'linear-gradient(135deg, #00bcd4, #0097a7)',
    },
    'quiz_pass': { 
      label: 'Quiz Passed with Honors', 
      icon: 'solar:star-bold', 
      muiIcon: EmojiEventsIcon,
      color: '#ffc107', 
      bg: 'rgba(255, 193, 7, 0.1)',
      gradient: 'linear-gradient(135deg, #ffc107, #ffb300)',
    },
    'lesson_complete': { 
      label: 'Lesson Completed', 
      icon: 'solar:play-bold', 
      muiIcon: MenuBookIcon,
      color: '#3f51b5', 
      bg: 'rgba(63, 81, 181, 0.1)',
      gradient: 'linear-gradient(135deg, #3f51b5, #303f9f)',
    },
    'login': { 
      label: 'User Logged In', 
      icon: 'solar:login-2-bold', 
      muiIcon: LoginIcon,
      color: '#757575', 
      bg: 'rgba(117, 117, 117, 0.1)',
      gradient: 'linear-gradient(135deg, #757575, #616161)',
    },
  };
  return actionMap[action] || { 
    label: action, 
    icon: 'solar:bell-bold', 
    muiIcon: NotificationsActiveIcon,
    color: '#00bfff', 
    bg: 'rgba(0, 191, 255, 0.1)',
    gradient: 'linear-gradient(135deg, #00bfff, #0099cc)',
  };
};

// Mock relevant e-learning notifications
const mockRelevantNotifications: NotificationItem[] = [
  {
    _id: '1',
    action: 'student_signup',
    userRole: 'student',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    userId: {
      _id: 's1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      role: 'student',
      image: '',
    },
  },
  {
    _id: '2',
    action: 'course_enroll',
    userRole: 'student',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    userId: {
      _id: 's2',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.c@example.com',
      role: 'student',
    },
    courseId: {
      _id: 'c1',
      courseName: 'Kuhesabu: Advanced Mathematics',
    },
  },
  {
    _id: '3',
    action: 'quiz_pass',
    userRole: 'student',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    userId: {
      _id: 's3',
      firstName: 'Aisha',
      lastName: 'Mohamed',
      email: 'aisha.m@example.com',
      role: 'student',
    },
    courseId: {
      _id: 'c2',
      courseName: 'Kusoma: Reading Comprehension',
    },
  },
  {
    _id: '4',
    action: 'instructor_signup',
    userRole: 'instructor',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    userId: {
      _id: 'i1',
      firstName: 'David',
      lastName: 'Kimani',
      email: 'david.k@example.com',
      role: 'instructor',
      image: '',
    },
  },
  {
    _id: '5',
    action: 'course_complete',
    userRole: 'student',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    userId: {
      _id: 's4',
      firstName: 'Fatima',
      lastName: 'Mwangi',
      email: 'fatima.m@example.com',
      role: 'student',
    },
    courseId: {
      _id: 'c3',
      courseName: 'Kuhesabu: Basic Numbers',
    },
  },
  {
    _id: '6',
    action: 'lesson_complete',
    userRole: 'student',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    userId: {
      _id: 's5',
      firstName: 'James',
      lastName: 'Ochieng',
      email: 'james.o@example.com',
      role: 'student',
    },
    courseId: {
      _id: 'c4',
      courseName: 'Kusoma: Alphabet Mastery',
    },
  },
  {
    _id: '7',
    action: 'course_enroll',
    userRole: 'student',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    userId: {
      _id: 's6',
      firstName: 'Grace',
      lastName: 'Nduta',
      email: 'grace.n@example.com',
      role: 'student',
    },
    courseId: {
      _id: 'c5',
      courseName: 'Kuhesabu: Multiplication Tables',
    },
  },
  {
    _id: '8',
    action: 'quiz_submit',
    userRole: 'student',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    userId: {
      _id: 's7',
      firstName: 'Brian',
      lastName: 'Odhiambo',
      email: 'brian.o@example.com',
      role: 'student',
    },
    courseId: {
      _id: 'c6',
      courseName: 'Kusoma: Story Reading',
    },
  },
  {
    _id: '9',
    action: 'login',
    userRole: 'instructor',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    userId: {
      _id: 'i2',
      firstName: 'Mary',
      lastName: 'Wanjiku',
      email: 'mary.w@example.com',
      role: 'instructor',
    },
  },
];

const Notifications = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // const data = await fetchNotifications();
      // Use mock data for now, replace with actual API data when available
      setNotifications(mockRelevantNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      // Fallback to mock data on error
      setNotifications(mockRelevantNotifications);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMarkAllRead = () => {
    // In a real app, this would call an API
    console.log('Mark all as read');
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.action.includes(filter));

  const unreadCount = notifications.length; // In a real app, track read/unread status

  if (loading) return <Loader />;
  if (error) return (
    <Fade in>
      <Box p={3}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          {error}
        </Alert>
      </Box>
    </Fade>
  );

  return (
    <Fade in timeout={500}>
      <Box p={3}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: theme.shadows[8],
          }}
        >
          {/* Header */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            mb={3}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <NotificationsActiveIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  Activity & Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Stay updated with platform activities
                </Typography>
              </Box>
              {unreadCount > 0 && (
                <Zoom in>
                  <Chip
                    label={`${unreadCount} new`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      fontWeight: 600,
                      ml: 2,
                    }}
                  />
                </Zoom>
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshIcon className={refreshing ? 'spin' : ''} />
              </IconButton>
              <IconButton
                onClick={handleMarkAllRead}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <DoneAllIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
            {['all', 'student', 'instructor', 'course', 'quiz'].map((filterType) => (
              <Chip
                key={filterType}
                label={filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                onClick={() => setFilter(filterType)}
                icon={filterType === 'all' ? <FilterListIcon /> : undefined}
                sx={{
                  bgcolor: filter === filterType ? 'primary.main' : alpha(theme.palette.primary.main, 0.05),
                  color: filter === filterType ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: filter === filterType ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
                  },
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                }}
              />
            ))}
          </Stack>

          {/* Notifications List */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 0, 
              overflow: 'hidden',
              bgcolor: alpha(theme.palette.background.default, 0.4),
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {filteredNotifications.length === 0 ? (
              <Fade in>
                <Box 
                  p={6} 
                  textAlign="center"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      display: 'inline-flex',
                    }}
                  >
                    <NotificationsActiveIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.3) }} />
                  </Box>
                  <Typography variant="h6" color="text.primary">
                    No notifications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for updates
                  </Typography>
                </Box>
              </Fade>
            ) : (
              <List disablePadding>
                {filteredNotifications.map((item, index) => {
                  const details = getActionDetails(item.action);
                  const isLast = index === filteredNotifications.length - 1;
                  const timeAgo = getTimeAgo(item.timestamp);
                  const IconComponent = details.muiIcon;

                  return (
                    <Grow
                      in
                      timeout={300 + index * 100}
                      key={item._id}
                    >
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          px: 3,
                          py: 2.5,
                          borderBottom: isLast ? 'none' : `1px solid ${theme.palette.divider}`,
                          transition: 'all 0.2s ease',
                          bgcolor: alpha(details.bg, 0.2),
                          '&:hover': {
                            bgcolor: alpha(details.bg, 0.4),
                            transform: 'translateX(5px)',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color="primary"
                            variant="dot"
                            invisible={index > 2} // First 3 are "new"
                            sx={{
                              '& .MuiBadge-badge': {
                                bgcolor: theme.palette.primary.main,
                                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                              },
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: details.bg,
                                background: details.gradient,
                                width: 48,
                                height: 48,
                                boxShadow: `0 4px 10px ${alpha(details.color, 0.3)}`,
                              }}
                            >
                              <IconComponent sx={{ color: 'white', fontSize: 24 }} />
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                {details.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {timeAgo}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {item.userId && (
                                  <strong style={{ color: theme.palette.text.primary }}>
                                    {item.userId.firstName} {item.userId.lastName}
                                  </strong>
                                )}
                                {item.userId?.role && (
                                  <Chip
                                    label={item.userId.role}
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      height: 20,
                                      fontSize: '0.7rem',
                                      bgcolor: alpha(details.color, 0.1),
                                      color: details.color,
                                    }}
                                  />
                                )}
                              </Typography>
                              {item.courseId && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  Course: <strong>{item.courseId.courseName}</strong>
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {new Date(item.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </Grow>
                  );
                })}
              </List>
            )}
          </Paper>

          {/* Footer Stats */}
          {filteredNotifications.length > 0 && (
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              sx={{ mt: 2 }}
            >
              <Typography variant="caption" color="text.secondary">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </Typography>
              <Chip
                label="View All"
                size="small"
                onClick={() => setFilter('all')}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                }}
              />
            </Stack>
          )}
        </Paper>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </Box>
    </Fade>
  );
};

export default Notifications;