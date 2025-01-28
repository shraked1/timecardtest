'use client';

import Link from 'next/link';

export default function TopNav() {
  return (
    <nav className="bg-emerald-400 px-4 py-2 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="text-white text-2xl font-bold">
        shiftlab
      </Link>

      {/* Navigation Items */}
      <div className="flex items-center space-x-2">
        <NavButton label="Reporting" />
        <NavButton label="Locations" />
        <NavButton label="Employees" />
        <NavButton label="Settings" />
        <NavButton label="Help center" className="bg-amber-400" />
        
        {/* Support Button */}
        <button className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 text-sm">
          <span className="text-gray-600 mr-1">SS</span>
          Support Support
        </button>

        {/* Notification and Profile */}
        <div className="flex items-center space-x-2 ml-2">
          <button className="relative p-2 text-white hover:bg-emerald-500 rounded-md">
            <span className="absolute -top-1 -right-1 bg-amber-400 text-xs w-4 h-4 rounded-full flex items-center justify-center">1</span>
            <BellIcon />
          </button>
          <button className="p-2 text-white hover:bg-emerald-500 rounded-md">
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </nav>
  );
}

// Helper Components
const NavButton = ({ label, className = "bg-emerald-500" }: { label: string; className?: string }) => (
  <button className={`${className} text-white px-3 py-1.5 rounded-md text-sm hover:opacity-90`}>
    {label}
  </button>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
); 