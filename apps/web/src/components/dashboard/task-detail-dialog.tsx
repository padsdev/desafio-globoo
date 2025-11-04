"use client";

import { Task } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, User, Clock } from "lucide-react";

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export function TaskDetailDialog({ task, open, onClose }: TaskDetailDialogProps) {
  const statusColors = {
    TODO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-secondary/10 text-secondary border-secondary/20",
    DONE: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  const priorityColors = {
    LOW: "bg-gray-500/10 text-gray-400",
    MEDIUM: "bg-yellow-500/10 text-yellow-400",
    HIGH: "bg-orange-500/10 text-orange-400",
    URGENT: "bg-red-500/10 text-red-400",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <DialogDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className={statusColors[task.status]}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Criado por:</span>
              <span className="font-medium">{task.author.username}</span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Vencimento:</span>
                <span className="font-medium">
                  {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Criado em:</span>
              <span className="font-medium">
                {format(new Date(task.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Atualizado em:</span>
              <span className="font-medium">
                {format(new Date(task.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>

          {task.assignedUsers && task.assignedUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Atribuído a</h3>
              <div className="flex flex-wrap gap-2">
                {task.assignedUsers.map((user) => (
                  <Badge key={user.id} variant="outline">
                    {user.username}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
