import React, { useRef, useEffect, memo } from "react";
import { Search, X } from "lucide-react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClose?: () => void;
  onForceClose?: () => void;
  autoFocus?: boolean;
}

export const SearchBar = memo(
  ({
    value,
    onChange,
    placeholder = "Search...",
    onClose,
    onForceClose,
    autoFocus = false,
  }: SearchBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (onForceClose) {
          onForceClose();
        }
      }
    };

    const handleClear = () => {
      onChange("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    return (
      <div className="relative w-full">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors duration-200">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          onBlur={() => onClose && onClose()}
          className="input-enhanced w-full py-2 pr-10 pl-10 body-small placeholder:text-muted-foreground/70 hover-lift focus:shadow-lg transition-all duration-200"
          aria-label="Search"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-200 hover:scale-110 focus-ring rounded-sm"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";
