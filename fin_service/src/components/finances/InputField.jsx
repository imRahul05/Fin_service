import React, { useRef } from 'react';

const InputField = ({ label, name, value, onChange, type = "number", min = "0", step = "1", prefix = "₹" }) => {
  const inputRef = useRef(null);
  
  const handleInputChange = (e) => {
    onChange({
      target: {
        name,
        value: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
      }
    });
  };
  
  return (
    <div className="sm:col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name={name}
          id={name}
          value={value === 0 ? '' : value}
          onChange={handleInputChange}
          className={`${prefix ? 'pl-8' : 'pl-3'} block w-full pr-3 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>
    </div>
  );
};

export default InputField;