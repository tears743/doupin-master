import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl transform transition-all">
        <div className="flex flex-col items-center text-center space-y-4">
          {type === 'success' && <CheckCircle className="w-12 h-12 text-green-500" />}
          {type === 'error' && <AlertCircle className="w-12 h-12 text-red-500" />}
          {type === 'info' && <AlertCircle className="w-12 h-12 text-blue-500" />}
          
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-gray-500">{message}</p>
          
          <button
            onClick={onClose}
            className="w-full py-2 bg-primary text-white rounded-lg hover:opacity-90 mt-4"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
