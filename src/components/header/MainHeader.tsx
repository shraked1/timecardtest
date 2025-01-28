'use client';

export default function MainHeader() {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
      {/* Date Navigation */}
      <div className="flex items-center gap-3">
        <DateSelector label="Mon, Jan 1" />
        <div className="flex items-center gap-1">
          <ChevronButton direction="left" />
          <ChevronButton direction="right" />
        </div>
        <DateSelector label="Tue, Jan 28" />
        <div className="h-6 w-px bg-gray-200 mx-2" />
        <button className="p-2 hover:bg-gray-50 border border-gray-200 rounded-md shadow-sm">
          <SearchIcon />
        </button>
        <select className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm text-gray-700 hover:border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-gray-100 rounded-md">
          Clear Filters
        </button>
        <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
          Run
        </button>
        <button className="px-3 py-1.5 text-sm bg-white border text-gray-600 rounded-md hover:bg-gray-50 flex items-center">
          <LockIcon className="w-4 h-4 mr-1" />
          Locked
        </button>
        <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
          Export
        </button>
      </div>
    </div>
  );
}

interface DateSelectorProps {
  label: string;
}

const DateSelector = ({ label }: DateSelectorProps) => (
  <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 rounded-md shadow-sm flex items-center gap-2">
    <CalendarIcon className="w-4 h-4 text-gray-400" />
    <span className="font-medium">{label}</span>
  </button>
);

interface ChevronButtonProps {
  direction: 'left' | 'right';
}

const ChevronButton = ({ direction }: ChevronButtonProps) => (
  <button className="p-2 hover:bg-emerald-50 border border-gray-200 rounded-md shadow-sm">
    <svg 
      className={`w-4 h-4 text-gray-600 ${direction === 'right' ? 'rotate-180' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LockIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
); 