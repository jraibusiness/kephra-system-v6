import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-blue-200 text-sm font-medium mb-1 ml-1 tracking-wide">
        {label}
      </label>
      <input
        className={`w-full bg-white/5 border-b border-blue-300/30 focus:border-blue-100 text-white placeholder-blue-300/50 px-3 py-3 outline-none transition-colors duration-300 rounded-t-sm ${className}`}
        {...props}
      />
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-blue-200 text-sm font-medium mb-1 ml-1 tracking-wide">
        {label}
      </label>
      <textarea
        className={`w-full bg-white/5 border-b border-blue-300/30 focus:border-blue-100 text-white placeholder-blue-300/50 px-3 py-3 outline-none transition-colors duration-300 rounded-t-sm min-h-[100px] resize-none ${className}`}
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-blue-200 text-sm font-medium mb-1 ml-1 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          className={`w-full bg-white/5 border-b border-blue-300/30 focus:border-blue-100 text-white px-3 py-3 outline-none transition-colors duration-300 rounded-t-sm appearance-none ${className}`}
          {...props}
        >
          <option value="" className="bg-slate-900 text-slate-400">Selecione...</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-white">
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-200">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};