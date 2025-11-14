import { Container, Typography, Button, Box } from '@mui/material';
import { Add } from '@mui/icons-material';

export default function Projects() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Proyectos
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Nuevo Proyecto
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary">
        No hay proyectos creados todavía.
      </Typography>
    </Container>
  );
}
