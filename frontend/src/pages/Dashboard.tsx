import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import {
  AccountTree,
  SmartToy,
  Assessment,
  Warning,
} from '@mui/icons-material';

export default function Dashboard() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountTree color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Proyectos</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Total de proyectos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmartToy color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Agentes</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Agentes activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Métricas</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Ejecuciones hoy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Alertas</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="text.secondary">
                Alertas activas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
