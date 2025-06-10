import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

interface Location {
  id: string;
  name: string;
  buildings: Building[];
}

interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

interface Floor {
  id: string;
  name: string;
  floorNumber: number;
  layoutData?: any;
}

interface Space {
  id: string;
  name: string;
  spaceType: { name: string };
  capacity?: number;
  features: string[];
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isAvailable?: boolean;
}

const MapViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [startTime, setStartTime] = useState<Dayjs>(dayjs().hour(9).minute(0));
  const [endTime, setEndTime] = useState<Dayjs>(dayjs().hour(17).minute(0));
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const spaceTypeFilter = searchParams.get('type');

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await axios.get('/locations');
      return response.data.locations;
    },
  });

  // Fetch spaces for selected floor
  const { data: floorData, isLoading: spacesLoading, refetch: refetchSpaces } = useQuery({
    queryKey: ['floor-spaces', selectedFloorId, selectedDate.format('YYYY-MM-DD'), startTime.format('HH:mm'), endTime.format('HH:mm')],
    queryFn: async () => {
      if (!selectedFloorId) return null;
      const response = await axios.get(`/spaces/floors/${selectedFloorId}`, {
        params: {
          date: selectedDate.format('YYYY-MM-DD'),
          startTime: startTime.format('HH:mm'),
          endTime: endTime.format('HH:mm'),
        },
      });
      return response.data;
    },
    enabled: !!selectedFloorId,
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await axios.post('/bookings', bookingData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floor-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      setBookingDialogOpen(false);
      setSelectedSpace(null);
      setNotes('');
    },
  });

  // Auto-select first available options
  useEffect(() => {
    if (locations && locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  useEffect(() => {
    if (selectedLocationId && locations) {
      const location = locations.find(l => l.id === selectedLocationId);
      if (location && location.buildings.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(location.buildings[0].id);
      }
    }
  }, [selectedLocationId, locations, selectedBuildingId]);

  useEffect(() => {
    if (selectedBuildingId && locations) {
      const location = locations.find(l => l.id === selectedLocationId);
      const building = location?.buildings.find(b => b.id === selectedBuildingId);
      if (building && building.floors.length > 0 && !selectedFloorId) {
        setSelectedFloorId(building.floors[0].id);
      }
    }
  }, [selectedBuildingId, locations, selectedLocationId, selectedFloorId]);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    setSelectedBuildingId('');
    setSelectedFloorId('');
  };

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedFloorId('');
  };

  const handleSpaceClick = (space: Space) => {
    setSelectedSpace(space);
    if (space.isAvailable) {
      setBookingDialogOpen(true);
    }
  };

  const handleBooking = () => {
    if (!selectedSpace) return;

    const bookingData = {
      spaceId: selectedSpace.id,
      startTime: selectedDate.hour(startTime.hour()).minute(startTime.minute()).toISOString(),
      endTime: selectedDate.hour(endTime.hour()).minute(endTime.minute()).toISOString(),
      notes: notes.trim() || undefined,
    };

    bookingMutation.mutate(bookingData);
  };

  const renderSpace = (space: Space) => {
    const isDesk = space.spaceType.name === 'Desk';
    const isFiltered = spaceTypeFilter && space.spaceType.name.toLowerCase() !== spaceTypeFilter;
    
    if (isFiltered) return null;

    let backgroundColor = '#e0e0e0'; // Default: unavailable
    if (space.isAvailable) {
      backgroundColor = isDesk ? '#4caf50' : '#2196f3'; // Green for desks, blue for rooms
    } else {
      backgroundColor = '#f44336'; // Red for booked
    }

    const coordinates = space.coordinates || { x: 0, y: 0, width: 40, height: 40 };

    return (
      <Box
        key={space.id}
        onClick={() => handleSpaceClick(space)}
        sx={{
          position: 'absolute',
          left: coordinates.x,
          top: coordinates.y,
          width: coordinates.width,
          height: coordinates.height,
          backgroundColor,
          border: selectedSpace?.id === space.id ? '3px solid #ff9800' : '1px solid #333',
          borderRadius: isDesk ? '4px' : '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold',
          '&:hover': {
            opacity: 0.8,
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
        }}
        title={`${space.name} - ${space.spaceType.name} - ${space.isAvailable ? 'Available' : 'Booked'}`}
      >
        {coordinates.width > 30 && (
          <Typography variant="caption" sx={{ color: 'inherit', fontSize: '8px' }}>
            {isDesk ? space.name.split('-').pop() : space.name.split(' ').pop()}
          </Typography>
        )}
      </Box>
    );
  };

  const selectedLocation = locations?.find(l => l.id === selectedLocationId);
  const selectedBuilding = selectedLocation?.buildings.find(b => b.id === selectedBuildingId);
  const selectedFloor = selectedBuilding?.floors.find(f => f.id === selectedFloorId);
  const spaces = floorData?.spaces || [];

  const availableSpaces = spaces.filter((s: Space) => s.isAvailable);
  const bookedSpaces = spaces.filter((s: Space) => !s.isAvailable);

  if (locationsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Interactive Floor Map
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={selectedLocationId}
                    label="Location"
                    onChange={(e) => handleLocationChange(e.target.value)}
                  >
                    {locations?.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Building</InputLabel>
                  <Select
                    value={selectedBuildingId}
                    label="Building"
                    onChange={(e) => handleBuildingChange(e.target.value)}
                    disabled={!selectedLocationId}
                  >
                    {selectedLocation?.buildings.map((building) => (
                      <MenuItem key={building.id} value={building.id}>
                        {building.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Floor</InputLabel>
                  <Select
                    value={selectedFloorId}
                    label="Floor"
                    onChange={(e) => setSelectedFloorId(e.target.value)}
                    disabled={!selectedBuildingId}
                  >
                    {selectedBuilding?.floors.map((floor) => (
                      <MenuItem key={floor.id} value={floor.id}>
                        {floor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={(newValue) => newValue && setSelectedDate(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  minDate={dayjs()}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={(newValue) => newValue && setStartTime(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={(newValue) => newValue && setEndTime(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Legend and Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Available: ${availableSpaces.length}`} color="success" variant="outlined" />
                <Chip label={`Booked: ${bookedSpaces.length}`} color="error" variant="outlined" />
                <Chip 
                  label="Desk" 
                  sx={{ backgroundColor: '#4caf50', color: 'white' }}
                />
                <Chip 
                  label="Room" 
                  sx={{ backgroundColor: '#2196f3', color: 'white' }}
                />
              </Box>
              <Button 
                variant="outlined" 
                onClick={() => refetchSpaces()}
                disabled={spacesLoading}
              >
                Refresh
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Map */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {spacesLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
            ) : selectedFloorId ? (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '600px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f9f9f9',
                  overflow: 'auto',
                }}
              >
                <Typography variant="h6" sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                  {selectedFloor?.name} - {selectedBuilding?.name}
                </Typography>
                
                {spaces.map(renderSpace)}
                
                {spaces.length === 0 && (
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    height="100%"
                  >
                    <Alert severity="info">
                      No spaces configured for this floor yet.
                    </Alert>
                  </Box>
                )}
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Alert severity="info">
                  Please select a location, building, and floor to view the map.
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Book {selectedSpace?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSpace && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Space:</strong> {selectedSpace.name} ({selectedSpace.spaceType.name})
              </Typography>
              {selectedSpace.capacity && (
                <Typography variant="body1" gutterBottom>
                  <strong>Capacity:</strong> {selectedSpace.capacity} people
                </Typography>
              )}
              <Typography variant="body1" gutterBottom>
                <strong>Date & Time:</strong> {selectedDate.format('DD.MM.YYYY')} from {startTime.format('HH:mm')} to {endTime.format('HH:mm')}
              </Typography>
              {selectedSpace.features.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Features:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedSpace.features.map((feature) => (
                      <Chip key={feature} label={feature} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="Add any additional notes for your booking..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBooking} 
            variant="contained"
            disabled={bookingMutation.isPending}
          >
            {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapViewPage;
