import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option...',
  className = '',
  icon: Icon = null,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options: can be array of strings or array of objects { value, label, subtext }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label || opt.value, subtext: opt.subtext || null };
    }
    return { value: opt, label: String(opt), subtext: null };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || null;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue) => {
    if (onChange) {
      onChange(optValue);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative flex flex-col ${isOpen ? 'z-[100]' : 'z-10'} ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl bg-surface-primary border transition-all duration-200 text-left flex items-center justify-between gap-3 group shadow-sm ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-border-subtle'
            : isOpen
            ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-surface-elevated'
            : 'border-border-subtle hover:border-border-strong hover:bg-surface-elevated cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <Icon size={16} className={`shrink-0 ${isOpen ? 'text-brand-primary' : 'text-text-muted'}`} />
          )}
          <span className={`text-sm font-medium truncate ${selectedOption ? 'text-text-main' : 'text-text-muted'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-primary' : 'group-hover:text-text-main'
          }`}
        />
      </button>

      {/* Custom Dropdown Popup Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100] rounded-xl bg-surface-elevated border border-border-strong shadow-2xl overflow-hidden ring-1 ring-white/10 animate-fade-in divide-y divide-border-subtle">
          <div className="max-h-56 overflow-y-auto p-1.5 dropdown-scrollbar flex flex-col gap-1">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-brand-primary/15 text-white font-semibold border border-brand-primary/40 shadow-sm'
                      : 'hover:bg-surface-elevated text-text-main hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate">{opt.label}</span>
                    {opt.subtext && (
                      <span className="text-[11px] text-text-muted truncate mt-0.5">{opt.subtext}</span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Check size={11} className="text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
