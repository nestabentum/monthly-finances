import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  details: string[];
  isVisible: boolean;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  details,
  isVisible,
  onDismiss,
}) => {
  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="notification-toast animate-slide-up-toast">
      <div className="toast-icon-wrapper">
        <Bell size={18} />
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
        {details.length > 0 && (
          <ul className="toast-details-list">
            {details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
      <button className="toast-dismiss-btn" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
};
