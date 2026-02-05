import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Circle,
  FolderPlus,
} from "lucide-react";

interface Task {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed";
  parentId: string | null;
  children?: Task[];
}

export default function TaskTree() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await window.electronAPI.getTasks();
      setTasks(buildTree(data));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const buildTree = (flatTasks: Task[]) => {
    const taskMap = new Map<string, Task>();
    const roots: Task[] = [];

    // Initialize map
    flatTasks.forEach((task) => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Build hierarchy
    flatTasks.forEach((task) => {
      const node = taskMap.get(task.id)!;
      if (task.parentId && taskMap.has(task.parentId)) {
        const parent = taskMap.get(task.parentId)!;
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const handleAddTask = async (parentId: string | null = null) => {
    const content = prompt("Enter task description:");
    if (!content) return;

    await window.electronAPI.addTask({ content, parentId, status: "pending" });
    fetchTasks();
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await window.electronAPI.updateTask(task.id, { status: newStatus });
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all subtasks.")) return;
    await window.electronAPI.deleteTask(id);
    fetchTasks();
  };

  const TaskNode = ({ task, level = 0 }: { task: Task; level?: number }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = task.children && task.children.length > 0;

    return (
      <div className="select-none">
        <div
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 group ${task.status === "completed" ? "opacity-60" : ""}`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1 rounded hover:bg-gray-200 ${hasChildren ? "visible" : "invisible"}`}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <button onClick={() => handleToggleStatus(task)}>
            {task.status === "completed" ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <span
            className={`flex-1 ${task.status === "completed" ? "line-through text-gray-500" : "text-gray-800"}`}
          >
            {task.content}
          </span>

          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
            <button
              onClick={() => handleAddTask(task.id)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Add Subtask"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(task.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && hasChildren && (
          <div>
            {task.children!.map((child) => (
              <TaskNode key={child.id} task={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FolderPlus className="w-8 h-8 text-indigo-600" />
          事项上树 (Task Tree)
        </h1>
        <button
          onClick={() => handleAddTask(null)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建根任务
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px] p-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No tasks yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-1">
            {tasks.map((task) => (
              <TaskNode key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
