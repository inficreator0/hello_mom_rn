import { Search, X } from "lucide-react";
import { Input } from "../ui/input";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  onFilterClick?: () => void;
}

const SearchBar = ({ placeholder = "Search...", value, onChange, className, onFilterClick }: SearchBarProps) => {
  const hasValue = value.trim().length > 0;

  return (
    <div className={`flex gap-2 items-center ${className || ""}`}>
      <div className="flex-1 flex items-center h-10 rounded-full bg-card border border-border/60 px-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-0 transition">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 border-none bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0"
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-full bg-card border border-border/60 shadow-sm text-foreground hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Filter"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;

