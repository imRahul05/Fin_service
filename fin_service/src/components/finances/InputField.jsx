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
      <label htmlFor={name} className="block text-xs font-semibold text-foreground/80 mb-1.5">
        {label}
      </label>
      <div className="relative rounded-2xl shadow-2xs">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-muted-foreground font-medium text-xs">{prefix}</span>
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
          className={`${prefix ? 'pl-9' : 'pl-3.5'} block w-full pr-3.5 py-2.5 text-xs font-semibold bg-background text-foreground border border-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-foreground transition`}
        />
      </div>
    </div>
  );
};

export default InputField;