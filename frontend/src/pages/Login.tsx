import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
} from '@mui/material';
import { useAuthStore } from '@store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      // Temporary mock login
      const mockUser = {
        id: '1',
        email,
        firstName: 'Admin',
        lastName: 'User',
        organizationId: '1',
      };
      const mockToken = 'mock-jwt-token';

      login(mockUser, mockToken);
      toast.success('Inicio de sesión exitoso');
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Agent Directory Manager
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Inicia sesión para continuar
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
