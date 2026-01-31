import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // Assuming you have this component

function Layout() {
  return (
    <div className="flex min-h-screen bg-black gpu-accelerate">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - Optimized for smooth scrolling */}
      <main 
        className="flex-1 p-6 overflow-y-auto smooth-scroll-container"
        style={{
          // Critical for smooth scrolling
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          transform: 'translateZ(0)',
          willChange: 'scroll-position'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;