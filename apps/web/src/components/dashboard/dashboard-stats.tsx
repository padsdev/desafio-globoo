"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasksStore } from "@/stores/tasks.store";
import { TaskStatus } from "@/types";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStats() {
  const { tasks, isLoading } = useTasksStore();
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  });

  useEffect(() => {
    const newStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
    };
    setStats(newStats);
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Tarefas",
      value: stats.total,
      icon: ListTodo,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "A Fazer",
      value: stats.todo,
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Em Progresso",
      value: stats.inProgress,
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Concluídas",
      value: stats.done,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="group hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
