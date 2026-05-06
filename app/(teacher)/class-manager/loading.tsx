import React from 'react';
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';

export default function Loading() {
  return (
    <div className="h-screen w-full bg-[#E2E7E9] relative">
      <Gr8LoadingOverlay isLoading={true} message="Redirecting..." />
    </div>
  );
}