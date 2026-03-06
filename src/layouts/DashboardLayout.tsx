import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '@/components/Topbar';

export default function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FAFAFA] font-sans text-gray-900">
      <Topbar />

      <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {/* Ambient Background Gradients */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-coral-400/5 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto pl-16 pr-10 py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
