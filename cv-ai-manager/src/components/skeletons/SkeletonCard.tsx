// src/components/skeletons/SkeletonCard.tsx
import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="flex flex-wrap gap-2 mt-2">
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        <div className="h-5 bg-gray-200 rounded-full w-24"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
