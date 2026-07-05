import { useState } from 'react';
import Calendar from 'react-calendar';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton,
  Stack,
  Chip,
  useTheme 
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import TodayIcon from '@mui/icons-material/Today';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import 'react-calendar/dist/Calendar.css';

type CalendarValue = Date | null | [Date | null, Date | null];

// Mock events data for demonstration
const mockEvents = [
  { date: new Date(2026, 2, 5), title: 'Course Enrollment Deadline', type: 'deadline' },
  { date: new Date(2026, 2, 8), title: 'New Course Launch: Advanced Math', type: 'launch' },
  { date: new Date(2026, 2, 12), title: 'Instructor Meeting', type: 'meeting' },
  { date: new Date(2026, 2, 15), title: 'Student Assessment Day', type: 'assessment' },
  { date: new Date(2026, 2, 18), title: 'Quiz Submission Deadline', type: 'deadline' },
  { date: new Date(2026, 2, 22), title: 'Workshop: Reading Skills', type: 'workshop' },
  { date: new Date(2026, 2, 25), title: 'Monthly Review', type: 'meeting' },
  { date: new Date(2026, 2, 28), title: 'Certificate Distribution', type: 'event' },
];

// Get events for a specific date
const getEventsForDate = (date: Date) => {
  return mockEvents.filter(event => 
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );
};

// Get event color based on type
const getEventColor = (type: string) => {
  const colors = {
    deadline: '#f44336',
    launch: '#4caf50',
    meeting: '#ff9800',
    assessment: '#9c27b0',
    workshop: '#2196f3',
    event: '#00bfff'
  };
  return colors[type as keyof typeof colors] || colors.event;
};

// Get event icon based on type
const getEventIcon = (type: string) => {
  switch (type) {
    case 'deadline': return '⏰';
    case 'launch': return '🚀';
    case 'meeting': return '👥';
    case 'assessment': return '📝';
    case 'workshop': return '🔧';
    default: return '📅';
  }
};

const CalendarPage = () => {
  const theme = useTheme();
  const [value, setValue] = useState(new Date());
  const [view, setView] = useState<'month' | 'agenda'>('month');
  const [selectedDateEvents, setSelectedDateEvents] = useState(getEventsForDate(new Date()));

  const handleDateChange = (val: CalendarValue) => {
    if (val instanceof Date) {
      setValue(val);
      setSelectedDateEvents(getEventsForDate(val));
    } else if (Array.isArray(val) && val.length > 0 && val[0] instanceof Date) {
      setValue(val[0]);
      setSelectedDateEvents(getEventsForDate(val[0]));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setValue(today);
    setSelectedDateEvents(getEventsForDate(today));
  };

  // Custom tile content to show event indicators
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    return (
      <Box sx={{ 
        display: 'flex', 
        gap: '2px', 
        justifyContent: 'center',
        mt: 0.5
      }}>
        {events.slice(0, 3).map((event, index) => (
          <Box
            key={index}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: getEventColor(event.type),
              boxShadow: `0 0 4px ${getEventColor(event.type)}`,
            }}
          />
        ))}
        {events.length > 3 && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6rem',
              color: 'text.secondary',
              ml: 0.5,
            }}
          >
            +{events.length - 3}
          </Typography>
        )}
      </Box>
    );
  };

// Custom navigation labels - with underscore to indicate intentionally unused
const formatMonthYear = (_locale: string | undefined, date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

  return (
    <Paper sx={{ 
      p: 3,
      height: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      borderRadius: 3,
      boxShadow: theme.shadows[8],
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <EventIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" color="text.primary" fontWeight={700}>
            Academic Calendar
          </Typography>
          <Chip
            icon={<TodayIcon />}
            label={value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton 
            onClick={() => setView('month')}
            sx={{
              bgcolor: view === 'month' ? 'primary.main' : 'transparent',
              color: view === 'month' ? 'white' : 'text.secondary',
              '&:hover': {
                bgcolor: view === 'month' ? 'primary.dark' : 'action.hover',
              }
            }}
          >
            <ViewModuleIcon />
          </IconButton>
          <IconButton 
            onClick={() => setView('agenda')}
            sx={{
              bgcolor: view === 'agenda' ? 'primary.main' : 'transparent',
              color: view === 'agenda' ? 'white' : 'text.secondary',
              '&:hover': {
                bgcolor: view === 'agenda' ? 'primary.dark' : 'action.hover',
              }
            }}
          >
            <ViewAgendaIcon />
          </IconButton>
          <IconButton onClick={handleToday} sx={{ color: 'text.secondary' }}>
            <TodayIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Main Content */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {/* Calendar Section */}
        <Box sx={{ 
          flex: view === 'month' ? 2 : 1,
          height: '100%',
          overflow: 'auto',
          pr: 2
        }}>
          <Box sx={{
            '& .react-calendar': {
              width: '100%',
              border: 'none',
              fontFamily: 'inherit',
              background: 'transparent',
            },
            '& .react-calendar__navigation': {
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              '& button': {
                minWidth: 40,
                height: 40,
                borderRadius: 1,
                color: 'text.primary',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&:disabled': {
                  opacity: 0.3,
                },
              },
            },
            '& .react-calendar__navigation__label': {
              flexGrow: 1,
              fontSize: '1.2rem !important',
              fontWeight: 700,
              color: 'primary.main',
            },
            '& .react-calendar__month-view__weekdays': {
              mb: 1,
              '& abbr': {
                color: 'text.secondary',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              },
            },
            '& .react-calendar__tile': {
              height: '90px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: '8px 4px',
              color: 'text.primary',
              background: 'transparent',
              border: '1px solid',
              borderColor: 'divider',
              margin: '2px',
              borderRadius: 2,
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
                transform: 'scale(1.02)',
                zIndex: 1,
                boxShadow: theme.shadows[4],
              },
              '&.react-calendar__tile--active': {
                bgcolor: 'primary.main',
                color: 'white',
                borderColor: 'primary.main',
                '& .react-calendar__tile__content': {
                  color: 'white',
                },
              },
              '&.react-calendar__tile--now': {
                bgcolor: 'action.selected',
                borderColor: 'primary.light',
                fontWeight: 700,
              },
              '&.react-calendar__tile--hasActive': {
                bgcolor: 'primary.light',
              },
              '&.react-calendar__month-view__days__day--weekend': {
                color: 'error.main',
              },
              '&.react-calendar__month-view__days__day--neighboringMonth': {
                color: 'text.disabled',
                '& .react-calendar__tile__content': {
                  color: 'text.disabled',
                },
              },
            },
            '& .react-calendar__tile__content': {
              fontWeight: 500,
              fontSize: '1rem',
            },
            '& .react-calendar__year-view__months__month': {
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 500,
            },
            '& .react-calendar__decade-view__years__year': {
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 500,
            },
          }}>
            <Calendar
              onChange={handleDateChange}
              value={value}
              calendarType="gregory"
              tileContent={tileContent}
              formatMonthYear={formatMonthYear}
              nextLabel={<ChevronRightIcon />}
              prevLabel={<ChevronLeftIcon />}
              next2Label={null}
              prev2Label={null}
              showNeighboringMonth={false}
            />
          </Box>
        </Box>

        {/* Events Section */}
        {view === 'month' && (
          <Box sx={{ 
            flex: 1,
            bgcolor: 'background.default',
            borderRadius: 2,
            p: 2,
            height: '100%',
            overflow: 'auto'
          }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <AccessTimeIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Events for {value.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Typography>
              <Chip 
                label={`${selectedDateEvents.length} events`}
                size="small"
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              />
            </Stack>

            {selectedDateEvents.length > 0 ? (
              <Stack spacing={2}>
                {selectedDateEvents.map((event, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderLeft: `4px solid ${getEventColor(event.type)}`,
                      borderRadius: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateX(5px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h5" sx={{ lineHeight: 1 }}>
                          {getEventIcon(event.type)}
                        </Typography>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.date.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={event.type}
                        size="small"
                        sx={{
                          bgcolor: `${getEventColor(event.type)}20`,
                          color: getEventColor(event.type),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  color: 'text.secondary'
                }}
              >
                <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1">
                  No events scheduled for this day
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Agenda View */}
        {view === 'agenda' && (
          <Box sx={{ 
            flex: 1,
            bgcolor: 'background.default',
            borderRadius: 2,
            p: 2,
            height: '100%',
            overflow: 'auto'
          }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <ViewAgendaIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Upcoming Events
              </Typography>
            </Stack>

            <Stack spacing={2}>
              {mockEvents
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateX(5px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h5" sx={{ lineHeight: 1 }}>
                          {getEventIcon(event.type)}
                        </Typography>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.date.toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })} • {event.date.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={event.type}
                        size="small"
                        sx={{
                          bgcolor: `${getEventColor(event.type)}20`,
                          color: getEventColor(event.type),
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default CalendarPage;