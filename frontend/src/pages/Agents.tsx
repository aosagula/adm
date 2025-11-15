import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Search,
  SmartToy,
  Edit,
  Delete,
  PowerSettingsNew,
  ContentCopy,
  Visibility,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { agentsService } from '@/services/agentsService';
import { projectsService } from '@/services/projectsService';
import CreateAgentDialog from '@/components/agents/CreateAgentDialog';
import EditAgentDialog from '@/components/agents/EditAgentDialog';
import DeleteAgentDialog from '@/components/agents/DeleteAgentDialog';
import { Agent } from '@/types';

export default function Agents() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Get project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getById(projectId!),
    enabled: !!projectId,
  });

  // Get agents
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', projectId, search],
    queryFn: () =>
      agentsService.getByProject(projectId!).then((data) => {
        if (search) {
          return data.filter(
            (agent) =>
              agent.name.toLowerCase().includes(search.toLowerCase()) ||
              agent.description?.toLowerCase().includes(search.toLowerCase())
          );
        }
        return data;
      }),
    enabled: !!projectId,
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => agentsService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', projectId] });
      toast.success('Estado del agente actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    },
  });

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditDialogOpen(true);
  };

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (agentId: string) => {
    navigate(`/projects/${projectId}/agents/${agentId}`);
  };

  if (!projectId) {
    return (
      <Container>
        <Typography color="error">ID de proyecto no válido</Typography>
      </Container>
    );
  }

  if (projectLoading || agentsLoading) {
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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Agentes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proyecto: {project?.name}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nuevo Agente
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Buscar agentes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {agents && agents.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <SmartToy sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No hay agentes creados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primer agente para comenzar
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
              Crear Agente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {agents?.map((agent) => (
            <Grid item xs={12} md={6} lg={4} key={agent.id}>
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
                  <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmartToy color="primary" />
                      <Typography variant="h6" component="h2">
                        {agent.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={agent.isActive ? 'Activo' : 'Inactivo'}
                      color={agent.isActive ? 'success' : 'default'}
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
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {agent.description || 'Sin descripción'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {agent._count && (
                      <>
                        <Chip label={`${agent._count.prompts} prompts`} size="small" variant="outlined" />
                        <Chip label={`${agent._count.metrics} métricas`} size="small" variant="outlined" />
                      </>
                    )}
                  </Box>

                  {agent.config && Object.keys(agent.config).length > 0 && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {agent.config.model && `Model: ${agent.config.model}`}
                        {agent.config.temperature && ` | Temp: ${agent.config.temperature}`}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(agent.id)}
                      title="Ver detalles"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(agent)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(agent)}
                      title="Eliminar"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => toggleActiveMutation.mutate(agent.id)}
                    title={agent.isActive ? 'Desactivar' : 'Activar'}
                    color={agent.isActive ? 'success' : 'default'}
                  >
                    <PowerSettingsNew />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <CreateAgentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        projectId={projectId}
      />

      {selectedAgent && (
        <>
          <EditAgentDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedAgent(null);
            }}
            agent={selectedAgent}
            projectId={projectId}
          />

          <DeleteAgentDialog
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedAgent(null);
            }}
            agent={selectedAgent}
            projectId={projectId}
          />
        </>
      )}
    </Container>
  );
}
