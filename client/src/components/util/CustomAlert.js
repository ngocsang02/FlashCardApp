import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';

const CustomAlert = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm', // confirm, success, error, warning, info, delete
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  showCancel = true,
  requirePassword = false,
  passwordHint = '',
}) => {
  // Di chuyển hook lên đầu function
  const [step, setStep] = React.useState('confirm'); // 'confirm' | 'password'
  const [password, setPassword] = React.useState(['', '', '', '', '', '']);
  const [error, setError] = React.useState('');
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setPassword(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  // Tạo refs cho 6 input fields
  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);



  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-orange-600 hover:bg-orange-700';
    }
  };

  const handleKeyDown = (index, e) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (password[index]) {
        // Nếu ô hiện tại có giá trị, xóa giá trị đó
        const newPassword = [...password];
        newPassword[index] = '';
        setPassword(newPassword);
      } else if (index > 0) {
        // Nếu ô hiện tại trống và không phải ô đầu tiên, xóa ô trước rồi focus về đó
        const newPassword = [...password];
        newPassword[index - 1] = '';
        setPassword(newPassword);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Xử lý nhập số
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const digit = e.key;
      
      // Kiểm tra xem giá trị có thực sự thay đổi không
      if (password[index] === digit) return;
      
      const newPassword = [...password];
      newPassword[index] = digit;
      setPassword(newPassword);
      setError('');

      // Tự động chuyển focus đến ô tiếp theo
      if (index < 5) {
        setTimeout(() => {
          if (inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
            inputRefs.current[index + 1].setSelectionRange(0, 0);
          }
        }, 100);
      }
    }
    
    // Ngăn chặn các phím không mong muốn
    if (!/^\d$/.test(e.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleConfirm = () => {
    if (step === 'confirm') {
      if (requirePassword) {
        setStep('password');
        setError('');
        setPassword(['', '', '', '', '', '']);
        // Focus vào ô đầu tiên khi chuyển sang bước nhập mật khẩu
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
        return;
      } else {
        // Nếu không yêu cầu mật khẩu, thực hiện ngay
        if (onConfirm) onConfirm();
        onClose();
        return;
      }
    }
    if (step === 'password') {
      const passwordString = password.join('');
      if (passwordString !== '357689') {
        setError('Mật khẩu không đúng!');
        // Reset password và focus vào ô đầu tiên
        setPassword(['', '', '', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
        return;
      }
      if (onConfirm) onConfirm();
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Alert Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 transform transition-all">
        {/* Header with Icon */}
        <div className="flex justify-center pt-8 pb-4">
          <div className={`p-3 rounded-full ${getBackgroundColor().replace('border', '')}`}>
            {getIcon()}
          </div>
        </div>
        
        {/* Title */}
        <div className="px-6 pb-2">
          <h3 className="text-xl font-bold text-gray-900 text-center">
            {step === 'confirm' ? title : 'Nhập mật khẩu xác nhận'}
          </h3>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          {step === 'confirm' ? (
            <p className="text-gray-600 text-center leading-relaxed">
              {message}
            </p>
          ) : (
            <>
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                Vui lòng nhập mật khẩu 6 số để xác nhận xóa.
              </p>
              
              {/* Password Input Fields */}
              <div className="flex justify-center space-x-2 mb-4">
                {password.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      digit 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                    value={digit}

                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={e => e.preventDefault()}
                    onDrop={e => e.preventDefault()}
                    onInput={e => e.preventDefault()}
                    onChange={e => e.preventDefault()}
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck="false"
                    readOnly
                  />
                ))}
              </div>
              
              {error && (
                <div className="text-sm text-red-500 text-center mt-2">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex space-x-3">
            {showCancel && (
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors ${getButtonColors()}`}
            >
              {step === 'confirm' ? confirmText : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert; 