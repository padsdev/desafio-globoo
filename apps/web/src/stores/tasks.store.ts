import { create } from 'zustand';
import { Task, TaskFilters, PaginatedResponse } from '@/types';
import { tasksService } from '@/services/tasks.service';

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  total: number;
  page: number;
  limit: number;
  filters: TaskFilters;
  isLoading: boolean;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, data: any) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
  clearCurrentTask: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  currentTask: null,
  total: 0,
  page: 1,
  limit: 10,
  filters: { page: 1, limit: 10 },
  isLoading: false,

  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true });
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const response: PaginatedResponse<Task> = await tasksService.getTasks(mergedFilters);
      
      set({
        tasks: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
        filters: mergedFilters,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchTask: async (id: string) => {
    set({ isLoading: true });
    try {
      const task = await tasksService.getTask(id);
      set({ currentTask: task, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createTask: async (data: any) => {
    const task = await tasksService.createTask(data);
    set((state) => ({
      tasks: [task, ...state.tasks],
      total: state.total + 1,
    }));
    return task;
  },

  updateTask: async (id: string, data: any) => {
    const updatedTask = await tasksService.updateTask(id, data);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
      currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
    }));
    return updatedTask;
  },

  deleteTask: async (id: string) => {
    await tasksService.deleteTask(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      total: state.total - 1,
      currentTask: state.currentTask?.id === id ? null : state.currentTask,
    }));
  },

  setFilters: (filters: TaskFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearCurrentTask: () => {
    set({ currentTask: null });
  },
}));
