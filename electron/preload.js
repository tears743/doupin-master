const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Brands & Colors
  getBrands: () => ipcRenderer.invoke('get-brands'),
  getColors: (brand, set) => ipcRenderer.invoke('get-colors', brand, set),
  
  // Works (Database)
  getWorks: () => ipcRenderer.invoke('get-works'),
  getWork: (id) => ipcRenderer.invoke('get-work', id),
  saveWork: (work) => ipcRenderer.invoke('save-work', work),
  deleteWork: (id) => ipcRenderer.invoke('delete-work', id),

  // Tasks (In-Memory)
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  updateTask: (id, updates) => ipcRenderer.invoke('update-task', id, updates),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),

  // Window controls
  windowMin: () => ipcRenderer.invoke('window-min'),
  windowMax: () => ipcRenderer.invoke('window-max'),
  windowClose: () => ipcRenderer.invoke('window-close'),
});
