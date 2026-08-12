'use client';

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
  disabled?: boolean;
}

export function ColorSelector({ colors, selectedColor, onSelectColor, disabled }: ColorSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Color: <span className="font-normal">{selectedColor}</span></h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Select color ${color}`}
            onClick={() => onSelectColor(color)}
            disabled={disabled}
            className={`h-8 w-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
              selectedColor === color ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-900' : 'border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
          />
        ))}
      </div>
    </div>
  );
}