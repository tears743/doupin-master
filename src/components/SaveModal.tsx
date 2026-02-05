import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
}

export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave, initialName = '' }) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-gray-100">保存作品</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              作品名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-gray-100"
              placeholder="请输入作品名称"
              autoFocus
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (name.trim()) {
                  onSave(name);
                }
              }}
              disabled={!name.trim()}
              className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
