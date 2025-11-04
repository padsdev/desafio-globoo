"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useTasksStore } from "@/stores/tasks.store";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { TaskFilters } from "@/components/dashboard/task-filters";
import { TaskList } from "@/components/dashboard/task-list";
import { CreateTaskDialog } from "@/components/dashboard/create-task-dialog";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchTasks } = useTasksStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    fetchTasks();
  }, [isAuthenticated, router, fetchTasks]);

  useNotifications((notification: Notification) => {
    toast.info(notification.message, {
      description: new Date(notification.createdAt).toLocaleString(),
    });
    
    // Refresh tasks if notification is task-related
    if (notification.type.startsWith('TASK_')) {
      fetchTasks();
    }
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <DashboardStats />
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TaskFilters />
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-primary font-semibold gap-2"
            >
              <Plus className="h-5 w-5" />
              Nova Tarefa
            </Button>
          </div>

          <TaskList />
        </div>
      </main>

      <CreateTaskDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
