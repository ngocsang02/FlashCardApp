import React, { useRef, useEffect, useState } from 'react';

/**
 * DropdownMenu
 * @param {React.ReactNode} trigger - Nút mở menu (thường là icon 3 chấm)
 * @param {Array<{ label: string, icon?: React.ReactNode, onClick: function, danger?: boolean }>} options - Danh sách lựa chọn
 * @param {string} className - Thêm class cho menu nếu muốn
 */
function DropdownMenu({ trigger, options = [], className = '' }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={e => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute right-0 z-20 mt-2 w-36 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}
        >
          <div className="py-1">
            {options.map((opt, idx) => (
              <button
                key={idx}
                className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors rounded-md hover:bg-gray-100 focus:outline-none ${opt.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-900'}`}
                onClick={e => {
                  e.stopPropagation();
                  setOpen(false);
                  opt.onClick && opt.onClick();
                }}
              >
                {opt.icon && <span className="mr-2">{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu; 