'use client';

import type { ProductSize } from '@/types';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: ProductSize | null;
  onSelectSize: (size: ProductSize) => void;
  disabled?: boolean;
}

export function SizeSelector({ sizes, selectedSize, onSelectSize, disabled }: SizeSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelectSize(size)}
            disabled={disabled}
            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}