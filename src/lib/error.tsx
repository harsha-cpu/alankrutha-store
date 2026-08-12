'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-6">We couldn't load the product details. Please try again.</p>
      <button
        onClick={() => reset()}
        className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}