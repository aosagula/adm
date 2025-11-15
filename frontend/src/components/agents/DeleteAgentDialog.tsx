import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { agentsService } from '@/services/agentsService';
import { Agent } from '@/types';

interface DeleteAgentDialogProps {
  open: boolean;
  onClose: () => void;
  agent: Agent;
  projectId: string;
}

export default function DeleteAgentDialog({
  open,
  onClose,
  agent,
  projectId,
}: DeleteAgentDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => agentsService.delete(agent.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', projectId] });
      toast.success('Agente eliminado exitosamente');
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al eliminar el agente';
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Eliminar Agente</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas eliminar el agente <strong>{agent.name}</strong>?
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al agente.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() => deleteMutation.mutate()}
          color="error"
          variant="contained"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
