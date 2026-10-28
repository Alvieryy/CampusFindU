import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  className = "",
  disabled = false,
  required = false,
  allowCustom = false,
  customLabelPrefix = "Use",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const normalizedOptions = options.map((opt) => {
    if (Array.isArray(opt)) {
      return { value: opt[0], label: opt[1] || opt[0] };
    }
    if (typeof opt === "object" && opt !== null) {
      return { value: opt.value, label: opt.label ?? opt.value };
    }
    return { value: String(opt), label: String(opt) };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const displayLabel = selectedOption
    ? selectedOption.label
    : value
    ? value
    : placeholder;

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange({
        target: {
          id,
          name: name || id,
          value: optionValue,
        },
      });
    }
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearch("");
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full min-h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-left outline-none transition flex items-center justify-between cursor-pointer focus:border-mmsu-green focus:ring-2 focus:ring-green-100 disabled:opacity-60 disabled:cursor-not-allowed ${
          className || ""
        }`}
      >
        <span
          className={`truncate pr-2 ${
            selectedOption || value
              ? "text-gray-900 font-medium"
              : "text-gray-400"
          }`}
        >
          {displayLabel}
        </span>

        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-mmsu-green" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-gray-200 bg-white p-2 shadow-2xl backdrop-blur-lg">
          <div className="relative mb-2">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 pl-9 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-mmsu-green focus:ring-1 focus:ring-green-200 placeholder:text-gray-400 transition"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {allowCustom &&
            search.trim() &&
            !normalizedOptions.some(
              (opt) =>
                opt.value.toLowerCase() === search.trim().toLowerCase() ||
                opt.label.toLowerCase() === search.trim().toLowerCase(),
            ) && (
              <button
                type="button"
                onClick={() => handleSelect(search.trim())}
                className="w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between bg-green-50/80 hover:bg-green-100 text-mmsu-green font-semibold transition cursor-pointer mb-2 border border-green-200"
              >
                <span className="truncate pr-2">
                  ➕ {customLabelPrefix} &quot;
                  <span className="font-bold underline">{search.trim()}</span>
                  &quot; as specific category
                </span>
                <span className="text-[10px] uppercase font-bold bg-green-200 text-green-900 px-1.5 py-0.5 rounded shrink-0">
                  Custom
                </span>
              </button>
            )}

          <div
            role="listbox"
            className="max-h-56 overflow-y-auto overscroll-contain space-y-1 divide-y divide-gray-50"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-5 text-center text-xs font-semibold text-gray-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? "bg-green-50 text-mmsu-green font-bold"
                        : "text-gray-700 hover:bg-gray-100 font-medium"
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-mmsu-green shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
