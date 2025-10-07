import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '../../services/api';

interface SystemConfig {
  ordering_window_start?: string;
  ordering_window_end?: string;
}

const SystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    orderingWindowStart: '',
    orderingWindowEnd: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config');

      if (response.data.success) {
        const configData = response.data.data;
        setConfig(configData);
        setFormData({
          orderingWindowStart: configData.ordering_window_start || '',
          orderingWindowEnd: configData.ordering_window_end || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setSaving(true);

      // Validation
      if (!formData.orderingWindowStart || !formData.orderingWindowEnd) {
        setError('Both start and end times are required');
        return;
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (
        !timeRegex.test(formData.orderingWindowStart) ||
        !timeRegex.test(formData.orderingWindowEnd)
      ) {
        setError('Invalid time format. Use HH:MM (e.g., 08:00)');
        return;
      }

      // Validate end time is after start time
      const [startHour, startMin] = formData.orderingWindowStart.split(':').map(Number);
      const [endHour, endMin] = formData.orderingWindowEnd.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        setError('End time must be after start time');
        return;
      }

      const response = await api.put('/admin/config', formData);

      if (response.data.success) {
        setSuccess('Configuration updated successfully');
        fetchConfig();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      orderingWindowStart: config.ordering_window_start || '',
      orderingWindowEnd: config.ordering_window_end || '',
    });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        System Configuration
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Ordering Window Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure the daily time window during which staff can place orders. The window
          applies to Monday-Friday only.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          <TextField
            label="Start Time"
            type="time"
            value={formData.orderingWindowStart}
            onChange={(e) =>
              setFormData({ ...formData, orderingWindowStart: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            helperText="Time when ordering window opens (e.g., 08:00)"
            fullWidth
          />

          <TextField
            label="End Time"
            type="time"
            value={formData.orderingWindowEnd}
            onChange={(e) =>
              setFormData({ ...formData, orderingWindowEnd: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            helperText="Time when ordering window closes (e.g., 10:30)"
            fullWidth
          />

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Current Window:</strong>{' '}
              {config.ordering_window_start || 'Not set'} -{' '}
              {config.ordering_window_end || 'Not set'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Changes will take effect immediately for all users.
            </Typography>
          </Alert>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleReset} disabled={saving}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 600, mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Configuration Guidelines
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            • Time format must be HH:MM (24-hour format)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • End time must be after start time
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Ordering window applies Monday through Friday only
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Staff can only order during the configured window
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SystemConfig;
