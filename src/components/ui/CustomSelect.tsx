import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%' }}
    >
      <button
        className={`btn ${isOpen ? '' : 'btn-secondary'}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <span style={{ color: selectedLabel === placeholder ? '#888' : '#fff' }}>
          {selectedLabel}
        </span>
        {isOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', padding: '4px' }}>
            {options.map((option) => (
              <button
                key={String(option.value)}
                className="btn"
                disabled={option.disabled}
                style={{
                  justifyContent: 'flex-start',
                  padding: '8px',
                  marginBottom: '2px',
                  border: 'none',
                  background: option.value === value ? 'var(--accent)' : 'transparent',
                  color: option.disabled ? '#555' : (option.value === value ? '#fff' : '#eee'),
                  opacity: option.disabled ? 0.6 : 1,
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.1s'
                }}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
