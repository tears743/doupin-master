/// <reference types="vite/client" />

interface Color {
  id: string;
  brand: string;
  name: string;
  rgb: [number, number, number];
  hex: string;
}

interface Brand {
  name: string;
  value: string;
  sets?: { name: string; id: string }[];
}

interface Task {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed";
  parentId: string | null;
  createdAt: number;
}

interface Work {
  id: number;
  name: string;
  width: number;
  height: number;
  data: (Color | null)[][]; // Grid data
  created_at: string;
  updated_at?: string;
}

interface Window {
  electronAPI: {
    getBrands: () => Promise<Brand[]>;
    getColors: (brand?: string, set?: string) => Promise<Color[]>;
    getWorks: () => Promise<Work[]>;
    getWork: (id: number) => Promise<Work>;
    saveWork: (work: Partial<Work>) => Promise<{ id: number; changes: number }>;
    deleteWork: (id: number) => Promise<{ changes: number }>;
    getTasks: () => Promise<Task[]>;
    addTask: (task: Partial<Task>) => Promise<Task>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
    deleteTask: (id: string) => Promise<void>;
    windowMin: () => Promise<void>;
    windowMax: () => Promise<void>;
    windowClose: () => Promise<void>;
  };
}
