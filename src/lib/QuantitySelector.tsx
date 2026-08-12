'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  maxQuantity: number;
  disabled?: boolean;
}

export function QuantitySelector({ quantity, setQuantity, maxQuantity, disabled }: QuantitySelectorProps) {
  const handleDecrement = () => {
    setQuantity(Math.max(1, quantity - 1));
  };

  const handleIncrement = () => {
    setQuantity(Math.min(maxQuantity, quantity + 1));
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
      <div className="flex items-center border border-gray-300 rounded-md w-fit">
        <button onClick={handleDecrement} disabled={quantity <= 1 || disabled} className="p-2 disabled:opacity-50">
          <Minus size={16} />
        </button>
        <span className="px-4 py-2 text-center w-16">{quantity}</span>
        <button onClick={handleIncrement} disabled={quantity >= maxQuantity || disabled} className="p-2 disabled:opacity-50">
          <Plus size={16} />
        </button>
      </div>
      {quantity >= maxQuantity && !disabled && (
        <p className="text-xs text-red-600 mt-1">Maximum stock quantity reached.</p>
      )}
    </div>
  );
}