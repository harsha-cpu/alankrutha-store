export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery Skeleton */}
        <div>
          <div className="bg-gray-200 rounded-lg h-96 w-full mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-200 rounded h-24 w-full"></div>
            <div className="bg-gray-200 rounded h-24 w-full"></div>
            <div className="bg-gray-200 rounded h-24 w-full"></div>
            <div className="bg-gray-200 rounded h-24 w-full"></div>
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="flex flex-col gap-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}