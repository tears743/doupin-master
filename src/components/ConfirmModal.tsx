import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-xl transform transition-all border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {type === 'danger' && <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" /></div>}
            {type === 'warning' && <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full"><AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" /></div>}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-all ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-primary hover:opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
