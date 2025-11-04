"use client";

import { Task, TaskStatus, TaskPriority } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Trash2, 
  User, 
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { EditTaskDialog } from "./edit-task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";
import { useTasksStore } from "@/stores/tasks.store";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { deleteTask } = useTasksStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const statusColors = {
    [TaskStatus.TODO]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    [TaskStatus.IN_PROGRESS]: "bg-secondary/10 text-secondary border-secondary/20",
    [TaskStatus.DONE]: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  const priorityColors = {
    [TaskPriority.LOW]: "bg-gray-500/10 text-gray-400",
    [TaskPriority.MEDIUM]: "bg-yellow-500/10 text-yellow-400",
    [TaskPriority.HIGH]: "bg-orange-500/10 text-orange-400",
    [TaskPriority.URGENT]: "bg-red-500/10 text-red-400",
  };

  const statusIcons = {
    [TaskStatus.TODO]: Clock,
    [TaskStatus.IN_PROGRESS]: AlertCircle,
    [TaskStatus.DONE]: CheckCircle2,
  };

  const StatusIcon = statusIcons[task.status];

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      try {
        await deleteTask(task.id);
        toast.success("Tarefa deletada com sucesso!");
      } catch (error) {
        toast.error("Erro ao deletar tarefa");
      }
    }
  };

  return (
    <>
      <Card className="group hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10 cursor-pointer" onClick={() => setShowDetail(true)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className={statusColors[task.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>

            {task.dueDate && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR })}
              </Badge>
            )}

            {task.assignedUsers && task.assignedUsers.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {task.assignedUsers.length} atribuído(s)
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Por {task.author.username}
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showEdit && (
        <EditTaskDialog
          task={task}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDetail && (
        <TaskDetailDialog
          task={task}
          open={showDetail}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
