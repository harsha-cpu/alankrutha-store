interface ProductPriceProps {
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
}

export function ProductPrice({
  price,
  compareAtPrice,
  currency = "INR",
}: ProductPriceProps) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  const formattedCompareAtPrice =
    compareAtPrice && compareAtPrice > price
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(compareAtPrice)
      : null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-bold text-[#7A1F3D]">
        {formattedPrice}
      </span>

      {formattedCompareAtPrice && (
        <span className="text-lg text-gray-400 line-through">
          {formattedCompareAtPrice}
        </span>
      )}
    </div>
  );
}