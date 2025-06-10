import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  EventSeat,
  MeetingRoom,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  availableDesks: number;
  availableRooms: number;
}

interface RecentBooking {
  id: string;
  space: {
    name: string;
    spaceType: { name: string };
    floor: {
      name: string;
      building: {
        name: string;
        location: { name: string };
      };
    };
  };
  startTime: string;
  endTime: string;
  status: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's recent bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<RecentBooking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await axios.get('/bookings/my-bookings?limit=5');
      return response.data.bookings;
    },
  });

  // Mock stats for now (in real app, fetch from API)
  const stats: DashboardStats = {
    totalBookings: bookings?.length || 0,
    upcomingBookings: bookings?.filter(b => new Date(b.startTime) > new Date()).length || 0,
    availableDesks: 156,
    availableRooms: 12,
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Here's an overview of your workspace bookings and available spaces.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalBookings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming
                  </Typography>
                  <Typography variant="h5">
                    {stats.upcomingBookings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventSeat color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Available Desks
                  </Typography>
                  <Typography variant="h5">
                    {stats.availableDesks}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MeetingRoom color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Available Rooms
                  </Typography>
                  <Typography variant="h5">
                    {stats.availableRooms}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            
            {bookingsLoading ? (
              <Typography>Loading...</Typography>
            ) : bookings && bookings.length > 0 ? (
              <List>
                {bookings.map((booking) => (
                  <ListItem
                    key={booking.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {booking.space.name}
                          </Typography>
                          <Chip 
                            label={booking.space.spaceType.name} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={booking.status} 
                            size="small" 
                            color={getStatusColor(booking.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {booking.space.floor.building.location.name} - {booking.space.floor.building.name} - {booking.space.floor.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No recent bookings found. Start by exploring available spaces!
              </Alert>
            )}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/bookings')}
              >
                View All Bookings
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LocationOn />}
                onClick={() => navigate('/map')}
                fullWidth
              >
                Browse Map
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<EventSeat />}
                onClick={() => navigate('/map?type=desk')}
                fullWidth
              >
                Book a Desk
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<MeetingRoom />}
                onClick={() => navigate('/map?type=room')}
                fullWidth
              >
                Book a Room
              </Button>
              
              <Button
                variant="text"
                size="large"
                startIcon={<CalendarToday />}
                onClick={() => navigate('/bookings')}
                fullWidth
              >
                My Bookings
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
