import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchLocations } from "../data/locations";

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  placeholder = "Start typing a suburb or city…",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(next: string) {
    onChange(next);
    setSuggestions(searchLocations(next));
    setOpen(true);
  }

  function pick(loc: string) {
    onChange(loc);
    setOpen(false);
  }

  return (
    <div className="formField locationField" ref={wrapRef}>
      <label>
        <span>{label}</span>
        <div className="locationInputWrap">
          <MapPin size={16} />
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => value && setSuggestions(searchLocations(value)) && setOpen(true)}
            autoComplete="off"
          />
        </div>
      </label>
      {open && suggestions.length > 0 && (
        <ul className="locationSuggestions">
          {suggestions.map((loc) => (
            <li key={loc}>
              <button type="button" onClick={() => pick(loc)}>{loc}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
