import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';






// Basic usage
{/* <SearchBar 
  onSearch={(query) => console.log('Searching for:', query)}
/> */}

// Customized usage
{/* <SearchBar
  onSearch={(query) => handleSearch(query)}
  placeholder="Find products..."
  debounceTime={500}
  className="max-w-xl mx-auto"
  showIcon={false}
/> */}



interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceTime?: number;
  className?: string;
  showIcon?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  debounceTime = 300,
  className = '',
  showIcon = true,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounce the search execution
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [query, debounceTime, onSearch]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSearch(query);
      }
    },
    [query, onSearch]
  );

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {showIcon && (
          <svg
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
            isFocused ? 'text-[#D9D9D9]' : 'text-gray-400'  // Updated color here
          }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-sm rounded-md shadow-sm border transition-all ${
            showIcon ? 'pl-8' : 'pl-3'
          } ${
            isFocused
              ? 'border-[#D9D9D9] ring-1 ring-[#D9D9D9]'
              : 'border-gray-300 hover:border-gray-400'
          } focus:outline-none`}
          aria-label="Search input"
        />
      </div>
    </motion.div>
  );
};

export default SearchBar;