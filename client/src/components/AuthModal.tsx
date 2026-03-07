import React, { useState } from 'react';
import { useModalStore } from 'store/useModalStore';
import { useAuth } from 'contexts/AuthContext';
import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  DialogContent,
  Stack,
  Typography,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { type FormData } from '@types';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
interface Props {}

const AuthModal: React.FC<Props> = () => {
  const { login, register } = useAuth();
  const { currentModal, setCurrentModal } = useModalStore();

  const isRegisterMode = currentModal === 'REGISTER';
  const isOpen = ['AUTH', 'LOGIN', 'REGISTER'].includes(currentModal);
  const onClose = () => setCurrentModal('');

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    userType: 'customer',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };
  console.log(formData);
  const clickSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      isRegisterMode ? await register(formData) : await login(formData);
      onClose();
    } catch (error: any) {
      setError(typeof error === 'string' ? error : JSON.stringify(error));
    }

    setLoading(false);
  };

  const isSubmitButtonDisabled = isRegisterMode
    ? !formData.username || !formData.password || !formData.image
    : !formData.username || !formData.password;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
        {isRegisterMode ? 'Create a new account' : 'Login to your account'}
      </DialogTitle>

      <Tabs
        value={currentModal}
        onChange={(_, newValue) => setCurrentModal(newValue)}
        variant="fullWidth"
      >
        <Tab label="Login" value="LOGIN" />
        <Tab label="Register" value="REGISTER" />
      </Tabs>

      <DialogContent
        sx={{
          minHeight: 260,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            variant="filled"
            fullWidth
            required
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            variant="filled"
            fullWidth
            required
          />

          {currentModal === 'REGISTER' && (
            <>
              <ToggleButtonGroup
                value={formData.userType}
                exclusive
                onChange={(_, newRole) => {
                  if (newRole !== null) {
                    setFormData({ ...formData, userType: newRole });
                  }
                }}
                fullWidth
                color="primary"
              >
                <ToggleButton value="CUSTOMER">Customer</ToggleButton>
                <ToggleButton value="SERVICE_PROVIDER">Service Provider</ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="outlined"
                component="label"
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  height: 48,
                }}
              >
                Upload Profile Picture *
                <input
                  type="file"
                  hidden
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
              </Button>

              {formData.image && (
                <Typography variant="body2" color="text.secondary">
                  {formData.image.name}
                </Typography>
              )}
            </>
          )}

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {loading ? (
          <CircularProgress size={28} />
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={clickSubmit}
            disabled={isSubmitButtonDisabled}
          >
            {isRegisterMode ? 'Register' : 'Login'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AuthModal;
