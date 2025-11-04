"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasksStore } from "@/stores/tasks.store";
import { TaskStatus, TaskPriority } from "@/types";
import { Search, X } from "lucide-react";

export function TaskFilters() {
  const { filters, fetchTasks, setFilters } = useTasksStore();
  const [search, setSearch] = useState(filters.search || "");

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters({ search: value, page: 1 });
    fetchTasks({ search: value, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    const newStatus = status === "all" ? undefined : (status as TaskStatus);
    setFilters({ status: newStatus, page: 1 });
    fetchTasks({ status: newStatus, page: 1 });
  };

  const handlePriorityFilter = (priority: string) => {
    const newPriority = priority === "all" ? undefined : (priority as TaskPriority);
    setFilters({ priority: newPriority, page: 1 });
    fetchTasks({ priority: newPriority, page: 1 });
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({ search: undefined, status: undefined, priority: undefined, page: 1 });
    fetchTasks({ search: undefined, status: undefined, priority: undefined, page: 1 });
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div className="relative flex-1 min-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select onValueChange={handleStatusFilter} value={filters.status || "all"}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={TaskStatus.TODO}>A Fazer</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>Em Progresso</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Concluída</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handlePriorityFilter} value={filters.priority || "all"}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value={TaskPriority.LOW}>Baixa</SelectItem>
          <SelectItem value={TaskPriority.MEDIUM}>Média</SelectItem>
          <SelectItem value={TaskPriority.HIGH}>Alta</SelectItem>
          <SelectItem value={TaskPriority.URGENT}>Urgente</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      )}
    </div>
  );
}
