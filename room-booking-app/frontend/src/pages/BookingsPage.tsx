import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { Cancel, LocationOn, Schedule } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface Booking {
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
  status: 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const BookingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: allBookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await axios.get('/bookings/my-bookings?limit=100');
      return response.data.bookings;
    },
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await axios.delete(`/bookings/${bookingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['floor-spaces'] });
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    },
  });

  const now = new Date();
  const upcomingBookings = allBookings.filter(
    booking => booking.status === 'confirmed' && new Date(booking.startTime) > now
  );
  const pastBookings = allBookings.filter(
    booking => booking.status === 'confirmed' && new Date(booking.startTime) <= now
  );
  const cancelledBookings = allBookings.filter(booking => booking.status === 'cancelled');

  const getBookingsForTab = (tab: number) => {
    switch (tab) {
      case 0: return upcomingBookings;
      case 1: return pastBookings;
      case 2: return cancelledBookings;
      default: return [];
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'confirmed') return false;
    const startTime = new Date(booking.startTime);
    const now = new Date();
    return startTime > now; // Can only cancel future bookings
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedBooking) {
      cancelMutation.mutate(selectedBooking.id);
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const renderBookingsTable = (bookings: Booking[]) => {
    if (bookings.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No bookings found in this category.
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Space</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{booking.space.name}</Typography>
                    <Chip 
                      label={booking.space.spaceType.name} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2">
                        {booking.space.floor.building.location.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {booking.space.floor.building.name} - {booking.space.floor.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Schedule fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2">
                        {formatDateTime(booking.startTime)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        to {new Date(booking.endTime).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={booking.status} 
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {booking.notes || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {canCancelBooking(booking) && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleCancelClick(booking)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Manage your desk and room reservations.
      </Typography>

      {/* Summary Stats */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6" color="primary">
              {upcomingBookings.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Upcoming
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="textSecondary">
              {pastBookings.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Past
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="error">
              {cancelledBookings.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cancelled
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label={`Upcoming (${upcomingBookings.length})`} />
          <Tab label={`Past (${pastBookings.length})`} />
          <Tab label={`Cancelled (${cancelledBookings.length})`} />
        </Tabs>
      </Box>

      {/* Bookings Table */}
      {renderBookingsTable(getBookingsForTab(tabValue))}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your booking for{' '}
            <strong>{selectedBooking?.space.name}</strong> on{' '}
            <strong>
              {selectedBooking && formatDateTime(selectedBooking.startTime)}
            </strong>
            ?
          </DialogContentText>
          <DialogContentText sx={{ mt: 1, color: 'error.main' }}>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Booking
          </Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            variant="contained"
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingsPage;
