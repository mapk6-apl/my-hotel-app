import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import '../../styles/screen1.css';

export type ToastType = 'success' | 'error' | 'info';

export type ToastProps = {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon text-emerald-600" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon text-rose-600" />;
      default:
        return <Info size={18} className="toast-icon text-amber-600" />;
    }
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        {renderIcon()}
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={onClose} className="toast-close-btn" aria-label="Dismiss Notification">
        <X size={14} />
      </button>
    </div>
  );
};
