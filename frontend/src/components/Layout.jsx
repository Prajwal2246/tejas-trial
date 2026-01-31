import React from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-black">
      {/* Main Content - Optimized for smooth scrolling */}
      <main 
        className="w-full min-h-screen overflow-y-auto"
        style={{
          // Critical for smooth scrolling
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
          backfaceVisibility: 'hidden'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;