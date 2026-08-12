interface ProductInfoProps {
  name: string;
  badge?: string;
  fabric: string;
  description: string;
}

export function ProductInfo({ name, badge, fabric, description }: ProductInfoProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-3xl font-bold font-serif text-gray-900">{name}</h1>
        {badge && (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">Fabric: {fabric}</p>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}