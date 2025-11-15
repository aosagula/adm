import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projectsService';
import { Project } from '@/types';
import toast from 'react-hot-toast';

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function DeleteProjectDialog({ open, onClose, project }: DeleteProjectDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: projectsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto archivado exitosamente');
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al archivar el proyecto';
      toast.error(message);
    },
  });

  const handleDelete = () => {
    if (project) {
      deleteMutation.mutate(project.id);
    }
  };

  if (!project) return null;

  const hasAgents = project._count?.agents && project._count.agents > 0;
  const hasMembers = project._count?.members && project._count.members > 1; // More than just the owner

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>¿Archivar Proyecto?</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          ¿Estás seguro de que deseas archivar el proyecto <strong>{project.name}</strong>?
        </Typography>

        {(hasAgents || hasMembers) && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Este proyecto tiene:
              {hasAgents && (
                <li>{project._count.agents} agente(s) asociado(s)</li>
              )}
              {hasMembers && (
                <li>{project._count.members} miembro(s) colaborando</li>
              )}
            </Typography>
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          El proyecto será archivado y no aparecerá en la lista principal. Podrás restaurarlo más tarde si lo necesitas.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Archivando...' : 'Archivar Proyecto'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
