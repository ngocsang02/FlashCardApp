import React, { useState, useCallback } from 'react';
import SimpleAlert from './SimpleAlert';

const SimpleAlertManager = () => {
  const [alertConfig, setAlertConfig] = useState(null);

  const showSimpleAlert = useCallback((config) => {
    setAlertConfig(config);
  }, []);

  const hideSimpleAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  // Expose showSimpleAlert globally
  React.useEffect(() => {
    window.showSimpleAlert = showSimpleAlert;
    return () => {
      delete window.showSimpleAlert;
    };
  }, [showSimpleAlert]);

  if (!alertConfig) return null;

  return (
    <SimpleAlert
      isOpen={true}
      onClose={hideSimpleAlert}
      onConfirm={alertConfig.onConfirm}
      title={alertConfig.title}
      message={alertConfig.message}
      confirmText={alertConfig.confirmText}
      cancelText={alertConfig.cancelText}
    />
  );
};

export default SimpleAlertManager; 