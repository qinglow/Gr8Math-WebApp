'use client';

import React from 'react';

export const LoadingDots = () => {
  return (
    <span className="inline-flex items-center text-2xl gap-1 leading-[0] h-5">
      <span className="animate-[pulse_1.5s_infinite_0ms]">.</span>
      <span className="animate-[pulse_1.5s_infinite_200ms]">.</span>
      <span className="animate-[pulse_1.5s_infinite_400ms]">.</span>
    </span>
  );
};