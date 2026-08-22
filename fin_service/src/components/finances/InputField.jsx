import { useRef } from 'react';

const InputField = ({ label, name, value, onChange, prefix = "₹" }) => {
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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{prefix}</span>
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
          className={`${prefix ? 'pl-8' : 'pl-3'} block w-full pr-3 py-2 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
        />
      </div>
    </div>
  );
};

export default InputField;