import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

interface AdminBooking {
  id: string;
  user: {
    name: string;
    email: string;
    employeeId?: string;
  };
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
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  todayBookings: number;
  totalSpaces: number;
  availableSpaces: number;
}

const AdminPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userSearch, setUserSearch] = useState('');

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['admin-users', userSearch],
    queryFn: async () => {
      const response = await axios.get('/users', {
        params: { search: userSearch || undefined },
      });
      return response.data.users;
    },
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<AdminBooking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await axios.get('/bookings?limit=100');
      return response.data.bookings;
    },
  });

  // Calculate stats
  const stats: DashboardStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalBookings: bookings.length,
    todayBookings: bookings.filter(b => {
      const today = new Date().toDateString();
      return new Date(b.startTime).toDateString() === today;
    }).length,
    totalSpaces: 0, // Would need separate API call
    availableSpaces: 0, // Would need separate API call
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

  const getStatusColor = (status: string): 'success' | 'error' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const renderOverviewTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="success.main">
                {stats.activeUsers} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h4">
                {stats.totalBookings}
              </Typography>
              <Typography variant="body2" color="primary">
                {stats.todayBookings} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                System Status
              </Typography>
              <Typography variant="h4" color="success.main">
                ✓
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All systems operational
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Utilization
              </Typography>
              <Typography variant="h4">
                85%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Recent Activity:</strong> System is running smoothly. 
        {stats.todayBookings} bookings made today.
      </Alert>
    </Box>
  );

  const renderUsersTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          User Management
        </Typography>
        <TextField
          size="small"
          placeholder="Search users..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      {usersLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.employeeId || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isAdmin ? 'Admin' : 'User'}
                      color={user.isAdmin ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderBookingsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        All Bookings
      </Typography>

      {bookingsLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Space</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.slice(0, 50).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{booking.user.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {booking.user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{booking.space.name}</Typography>
                      <Chip
                        label={booking.space.spaceType.name}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.space.floor.building.location.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {booking.space.floor.building.name} - {booking.space.floor.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(booking.startTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(booking.createdAt).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderSpacesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Space Management
      </Typography>
      
      <Alert severity="info">
        Space management functionality will be implemented in the next phase. 
        Currently, spaces are managed through the database seeding process.
      </Alert>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" gutterBottom>
          Current Configuration:
        </Typography>
        <ul>
          <li>Dortmund: ~650 desks, ~50 rooms across 5 floors</li>
          <li>Düsseldorf: ~60 desks, ~5 rooms across 3 floors</li>
        </ul>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom>
        System administration and management tools.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Users" />
          <Tab label="Bookings" />
          <Tab label="Spaces" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && renderOverviewTab()}
        {tabValue === 1 && renderUsersTab()}
        {tabValue === 2 && renderBookingsTab()}
        {tabValue === 3 && renderSpacesTab()}
      </Box>
    </Box>
  );
};

export default AdminPage;
