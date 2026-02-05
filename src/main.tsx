import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

// Mock Electron API for browser development
if (!window.electronAPI) {
  window.electronAPI = {
    getBrands: async () => [
      { name: "MARD", value: "MARD", sets: [{ name: "Standard", id: "full-221" }] }
    ],
    getColors: async () => [
      { id: "1", name: "Black", hex: "#000000" },
      { id: "2", name: "White", hex: "#FFFFFF" },
      { id: "3", name: "Red", hex: "#FF0000" },
      { id: "4", name: "Blue", hex: "#0000FF" },
      { id: "5", name: "Yellow", hex: "#FFFF00" },
    ],
    saveWork: async (data: any) => {
      console.log("Mock saveWork:", data);
      return { id: 123 };
    },
    getWorks: async () => [],
    getWork: async () => null,
    updateWork: async () => {},
    deleteWork: async () => {},
    exportImage: async () => {},
    on: () => {},
    off: () => {},
  } as any;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
