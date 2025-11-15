import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add, SmartToy, Visibility, Edit } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '@/services/projectsService';
import { Project, ProjectStatus } from '@/types';

const statusColors: Record<ProjectStatus, 'default' | 'primary' | 'warning' | 'success'> = {
  DEVELOPMENT: 'primary',
  QA: 'warning',
  PRODUCTION: 'success',
  ARCHIVED: 'default',
};

const statusLabels: Record<ProjectStatus, string> = {
  DEVELOPMENT: 'Desarrollo',
  QA: 'QA',
  PRODUCTION: 'Producción',
  ARCHIVED: 'Archivado',
};

export default function Projects() {
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getAll,
  });

  const handleViewAgents = (projectId: string) => {
    navigate(`/projects/${projectId}/agents`);
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

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

      {projects && projects.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No hay proyectos creados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primer proyecto para comenzar
            </Typography>
            <Button variant="contained" startIcon={<Add />}>
              Crear Proyecto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects?.map((project: Project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {project.name}
                    </Typography>
                    <Chip
                      label={statusLabels[project.status]}
                      color={statusColors[project.status]}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {project.description || 'Sin descripción'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {project._count && (
                      <>
                        <Chip
                          icon={<SmartToy />}
                          label={`${project._count.agents} agentes`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${project._count.members} miembros`}
                          size="small"
                          variant="outlined"
                        />
                      </>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<SmartToy />}
                    onClick={() => handleViewAgents(project.id)}
                  >
                    Ver Agentes
                  </Button>
                  <Box>
                    <IconButton size="small" title="Ver detalles">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" title="Editar">
                      <Edit />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
