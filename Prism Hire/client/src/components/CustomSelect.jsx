import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, className, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    // Helper to get display label for current value
    const getDisplayLabel = () => {
        const selectedOption = options.find(opt =>
            (typeof opt === 'object' ? opt.value : opt) === value
        );

        if (!selectedOption) return placeholder || "Select...";
        return typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
    };

    return (
        <div className="relative group" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between text-left ${className} ${isOpen ? 'ring-4 ring-brand-500/10 border-brand-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className="truncate mr-2">
                    {getDisplayLabel()}
                </span>
                <ChevronDown
                    className={`flex-shrink-0 w-4 h-4 text-marble-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-500' : 'group-hover:text-brand-500'}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-brand-500/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                    <div className="p-1.5 space-y-0.5">
                        {options.map((option) => {
                            const optValue = typeof option === 'object' ? option.value : option;
                            const optLabel = typeof option === 'object' ? option.label : option;
                            const isSelected = value === optValue;

                            return (
                                <button
                                    key={optValue}
                                    type="button"
                                    onClick={() => handleSelect(optValue)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isSelected
                                        ? 'bg-brand-500/10 text-brand-400'
                                        : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="truncate">{optLabel}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
