import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import '../../styles/screen1.css';

export type ToastType = 'success' | 'error' | 'info';

export type ToastProps = {
  message: string;
  type?: ToastType;
  isOpen: boolean;
  onClose: () => void;
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bgStyles: Record<ToastType, string> = {
    success: 'bg-[#656839] text-[#F4F9E9] border-[#514B23]',
    error: 'bg-[#991b1b] text-white border-red-800',
    info: 'bg-[#514B23] text-[#F4F9E9] border-[#656839]',
  };

  return (
    <div className="toast-notification-banner">
      <div className={'toast-inner ' + type}>
        {type === 'success' && <CheckCircle2 size={18} color="#BDDBD0" />}
        {type === 'error' && <AlertCircle size={18} color="#fee2e2" />}
        {type === 'info' && <Info size={18} color="#BDDBD0" />}

        <span className="toast-message-text">{message}</span>

        <button type="button" onClick={onClose} className="toast-close-btn" aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
