// 简单的内存存储
let tasks = [
  {
    id: "1",
    content: "完成豆拼项目",
    status: "in_progress",
    parentId: null,
    createdAt: Date.now()
  },
  {
    id: "2",
    content: "图片转图纸功能",
    status: "completed",
    parentId: "1",
    createdAt: Date.now()
  },
  {
    id: "3",
    content: "事项上树功能",
    status: "in_progress",
    parentId: "1",
    createdAt: Date.now()
  }
];

export function getTasks() {
  return tasks;
}

export function addTask(task) {
  const newTask = {
    ...task,
    id: Date.now().toString(),
    createdAt: Date.now(),
    status: task.status || "pending",
    parentId: task.parentId || null
  };
  tasks.push(newTask);
  return newTask;
}

export function updateTask(id, updates) {
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    return tasks[index];
  }
  return null;
}

export function deleteTask(id) {
  // 递归删除子任务
  const idsToDelete = [id];
  
  // 查找所有子任务
  let currentIdx = 0;
  while (currentIdx < idsToDelete.length) {
    const currentId = idsToDelete[currentIdx];
    const children = tasks.filter(t => t.parentId === currentId);
    children.forEach(c => idsToDelete.push(c.id));
    currentIdx++;
  }
  
  tasks = tasks.filter(t => !idsToDelete.includes(t.id));
  return true;
}
