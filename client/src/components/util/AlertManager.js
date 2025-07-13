import React, { useState, useCallback } from 'react';
import CustomAlert from './CustomAlert';

const AlertManager = () => {
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = useCallback((config) => {
    setAlertConfig(config);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  // Expose showAlert globally
  React.useEffect(() => {
    window.showAlert = showAlert;
    return () => {
      delete window.showAlert;
    };
  }, [showAlert]);

  if (!alertConfig) return null;

  return (
    <CustomAlert
      isOpen={true}
      onClose={hideAlert}
      onConfirm={alertConfig.onConfirm}
      title={alertConfig.title}
      message={alertConfig.message}
      type={alertConfig.type}
      confirmText={alertConfig.confirmText}
      cancelText={alertConfig.cancelText}
      showCancel={alertConfig.showCancel}
    />
  );
};

export default AlertManager; 