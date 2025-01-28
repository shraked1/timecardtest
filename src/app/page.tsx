'use client';

import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import AddPunchModal from '@/components/modals/AddPunchModal';
import { CalendarDays } from 'lucide-react';

interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  totalOT: number;
  isExpanded: boolean;
}

interface SplitPunch {
  timeIn: string;
  timeOut: string;
  type: 'Regular' | 'Selling' | 'Non-Selling';
  break?: string | null;
  hours: string;
}

interface PunchRecord {
  date: string;
  location: string;
  type: string;
  timeIn: string;
  timeOut: string;
  estOT: string;
  hours: string;
  break?: string | null;
  notes?: string;
  isPending?: boolean;
  isManual?: boolean;
  isDeleting?: boolean;
  splits?: SplitPunch[];
  splitCount?: number;
}

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PunchRecord | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: string]: boolean }>({});
  const [records, setRecords] = useState<PunchRecord[]>([]);

  // Load records from localStorage on initial render
  useEffect(() => {
    const savedRecords = localStorage.getItem('timecardRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timecardRecords', JSON.stringify(records));
  }, [records]);

  const handleAddPunch = (newPunch: PunchRecord) => {
    setRecords(prevRecords => {
      // If this is a split punch, we need to update or replace the existing record for that date
      const existingRecordIndex = prevRecords.findIndex(r => r.date === newPunch.date);
      
      let updatedRecords = [...prevRecords];
      if (existingRecordIndex >= 0) {
        // Update existing record
        updatedRecords[existingRecordIndex] = {
          ...newPunch,
          // Keep the earliest timeIn and latest timeOut
          timeIn: newPunch.splits ? 
            newPunch.splits[0].timeIn : 
            newPunch.timeIn,
          timeOut: newPunch.splits ? 
            newPunch.splits[newPunch.splits.length - 1].timeOut : 
            newPunch.timeOut,
          // Calculate total hours accounting for gaps
          hours: newPunch.splits ? 
            calculateTotalHoursWithGaps(newPunch.splits) + '/8.00' :
            newPunch.hours
        };
      } else {
        // Add new record
        updatedRecords.push(newPunch);
      }

      // Sort records
      return updatedRecords.sort((a, b) => {
        // Parse dates in MM/DD/YY format
        const [monthA, dayA, yearA] = a.date.split('/');
        const [monthB, dayB, yearB] = b.date.split('/');
        
        // Create Date objects for comparison (use full year)
        const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));

        // Compare dates
        return dateA.getTime() - dateB.getTime();
      });
    });
    setShowModal(false);
    setEditingRecord(null);
  };

  // Helper function to calculate total hours accounting for gaps between splits
  const calculateTotalHoursWithGaps = (splits: SplitPunch[]): string => {
    let totalMinutes = 0;
    
    splits.forEach(split => {
      // Convert times to minutes since midnight
      const [inHour, inMin] = split.timeIn.split(' ')[0].split(':');
      const [outHour, outMin] = split.timeOut.split(' ')[0].split(':');
      const inPeriod = split.timeIn.split(' ')[1];
      const outPeriod = split.timeOut.split(' ')[1];
      
      let startMinutes = (parseInt(inHour) % 12) * 60 + parseInt(inMin);
      if (inPeriod === 'PM' && inHour !== '12') startMinutes += 12 * 60;
      
      let endMinutes = (parseInt(outHour) % 12) * 60 + parseInt(outMin);
      if (outPeriod === 'PM' && outHour !== '12') endMinutes += 12 * 60;
      
      totalMinutes += endMinutes - startMinutes;
    });
    
    return (totalMinutes / 60).toFixed(2);
  };

  const handleApprove = (record: PunchRecord) => {
    setRecords(prevRecords => 
      prevRecords.map(r => 
        r.date === record.date ? { ...r, isPending: false } : r
      )
    );
  };

  const handleEdit = (record: PunchRecord) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleDelete = (recordToDelete: PunchRecord) => {
    // First set the record to be deleted to a fading out state
    setRecords(prevRecords => 
      prevRecords.map(r => 
        r.date === recordToDelete.date ? { ...r, isDeleting: true } : r
      )
    );

    // After animation, remove the record
    setTimeout(() => {
      setRecords(prevRecords => 
        prevRecords.filter(r => r.date !== recordToDelete.date)
      );
    }, 300); // Match this with CSS transition duration
  };

  // Group records by week and sort within each group
  const groupedRecords = records.reduce((acc: { [key: string]: typeof records }, record) => {
    // Parse the date in MM/DD/YY format
    const [month, day, year] = record.date.split('/');
    // Ensure we're using the correct year (20xx)
    const fullYear = year.length === 2 ? `20${year}` : year;
    const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
    
    // Get the start of the week (Sunday)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    
    // Format the week key as MM/DD/YYYY to match the display format
    const weekKey = weekStart.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(record);
    
    // Sort records within the week
    acc[weekKey].sort((a, b) => {
      const [monthA, dayA, yearA] = a.date.split('/');
      const [monthB, dayB, yearB] = b.date.split('/');
      const fullYearA = yearA.length === 2 ? `20${yearA}` : yearA;
      const fullYearB = yearB.length === 2 ? `20${yearB}` : yearB;
      
      const dateA = new Date(parseInt(fullYearA), parseInt(monthA) - 1, parseInt(dayA));
      const dateB = new Date(parseInt(fullYearB), parseInt(monthB) - 1, parseInt(dayB));

      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;

      // If same date, sort by time
      const timeA = a.timeIn.toLowerCase();
      const timeB = b.timeIn.toLowerCase();
      
      // Convert time to 24-hour format for comparison
      const matchA = timeA.match(/(\d+):(\d+)\s*(am|pm)/i);
      const matchB = timeB.match(/(\d+):(\d+)\s*(am|pm)/i);
      
      if (!matchA || !matchB) return 0;
      
      const [, hourA, minA, periodA] = matchA;
      const [, hourB, minB, periodB] = matchB;
      
      const hour24A = (parseInt(hourA) % 12) + (periodA.toLowerCase() === 'pm' ? 12 : 0);
      const hour24B = (parseInt(hourB) % 12) + (periodB.toLowerCase() === 'pm' ? 12 : 0);
      
      if (hour24A !== hour24B) return hour24A - hour24B;
      return parseInt(minA) - parseInt(minB);
    });
    return acc;
  }, {});

  // Calculate week summaries (excluding pending entries)
  const weekSummaries = Object.entries(groupedRecords).map(([weekKey, records]) => {
    // Parse the week start date
    const [month, day, year] = weekKey.split('/');
    const weekStart = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const approvedRecords = records.filter(record => !record.isPending);
    
    const totalHours = approvedRecords.reduce((sum, record) => {
      return sum + parseFloat(record.hours.split('/')[0]);
    }, 0);
    
    const totalOT = approvedRecords.reduce((sum, record) => {
      return sum + parseFloat(record.estOT);
    }, 0);

    return {
      weekStart: weekStart.toLocaleDateString(),
      weekEnd: weekEnd.toLocaleDateString(),
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalOT: parseFloat(totalOT.toFixed(2)),
      records
    };
  });

  // Sort week summaries by date
  weekSummaries.sort((a, b) => {
    // Parse dates in MM/DD/YY format from weekStart
    const [monthA, dayA, yearA] = a.weekStart.split('/');
    const [monthB, dayB, yearB] = b.weekStart.split('/');
    const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
    const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate grand totals (excluding pending entries)
  const grandTotal = {
    hours: weekSummaries.reduce((sum, week) => sum + week.totalHours, 0),
    ot: weekSummaries.reduce((sum, week) => sum + week.totalOT, 0)
  };

  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekKey]: !prev[weekKey]
    }));
  };

  const renderActionButtons = (record: PunchRecord) => {
    if (record.isPending) {
      return (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleApprove(record)}
            className="p-1.5 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-colors"
            title="Approve"
          >
            <CheckIcon />
          </button>
          <button 
            onClick={() => handleEdit(record)}
            className="p-1.5 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
            title="Edit"
          >
            <PencilIcon />
          </button>
          <button 
            onClick={() => handleDelete(record)}
            className="p-1.5 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      );
    }
    return (
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEdit(record)}
            className="p-1.5 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
            title="Edit"
          >
            <PencilIcon />
          </button>
          <button 
            onClick={() => handleDelete(record)}
            className="p-1.5 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="View in Calendar"
          >
            <CalendarIcon />
          </button>
          {record.splits && record.splits.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md" title={`${record.splits.length} splits`}>
              <SplitIcon />
              <span className="text-xs font-medium text-gray-700">{record.splits.length}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow w-full overflow-hidden">
        {/* Employee Info */}
        <div className="border-b">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gray-300" />
              </div>
              <div>
                <h2 className="font-medium text-black">Aaron Layacan</h2>
                <p className="text-sm text-black">Sales Representative</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-black">
                2 Issues & 3 Approvals Remaining
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-700"
              >
                <CalendarDays className="w-5 h-5" />
                Add Punch
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-white border-t border-b text-sm font-medium text-black">
            <div>Date</div>
            <div>Time In</div>
            <div>Time Out</div>
            <div>Break</div>
            <div>Est OT</div>
            <div>Hours</div>
            <div>Notes</div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="min-w-fit">
            {weekSummaries.map((week, weekIndex) => (
              <div key={week.weekStart} className="border-b last:border-b-0">
                {/* Week Summary Row - Moved to top */}
                <button
                  onClick={() => toggleWeek(week.weekStart)}
                  className="w-full grid grid-cols-7 gap-4 px-4 py-3 text-sm bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer group border-b"
                >
                  <div className="flex items-center gap-2 text-black">
                    <ChevronIcon expanded={expandedWeeks[week.weekStart] !== false} />
                    <span className="font-medium">Week of {week.weekStart}</span>
                    <span className="text-xs text-gray-500">(Approved entries only)</span>
                  </div>
                  <div className="col-span-3 text-black text-left">
                    {week.weekStart} - {week.weekEnd}
                  </div>
                  <div className="font-medium text-black text-left">{week.totalOT}</div>
                  <div className="font-medium text-black text-left">{week.totalHours}</div>
                  <div></div>
                </button>

                {/* Week's Entries */}
                {expandedWeeks[week.weekStart] !== false && week.records.map((record, index) => (
                  <div 
                    key={record.date}
                    className={`grid grid-cols-7 gap-4 px-4 py-3 text-sm ${
                      record.isPending ? 'bg-amber-50/70' : 
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 transition-colors duration-300 ${
                      record.isDeleting ? 'opacity-0 transform translate-x-full' : 'opacity-100'
                    } ${
                      !record.isPending ? '' : 'opacity-75'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-black">{record.date}</span>
                        {!record.isPending && record.isManual && (
                          <span title="Manual Entry" className="text-gray-500">
                            <ClipboardIcon />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-black">{record.location}</span>
                      <span className="text-xs text-black">{record.type}</span>
                      {record.isPending && (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <span>Pending Approval</span>
                          <span title="Not included in totals" className="text-amber-500">
                            <AlertCircleIcon />
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-black">{record.timeIn}</div>
                    <div className="text-black">{record.timeOut}</div>
                    <div className="text-black">{record.break || ''}</div>
                    <div className="text-black">{record.estOT}</div>
                    <div className="text-black">{record.hours}</div>
                    <div className="flex justify-between items-center">
                      {renderActionButtons(record)}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Grand Total */}
            <div className="grid grid-cols-7 gap-4 px-4 py-4 text-sm bg-gray-50 border-t">
              <div className="flex items-center gap-2">
                <span className="font-medium text-black">Total Summary</span>
                <span className="text-xs text-gray-500">(Approved entries only)</span>
              </div>
              <div className="col-span-3"></div>
              <div className="font-medium text-black">{grandTotal.ot.toFixed(2)}</div>
              <div className="font-medium text-black">{grandTotal.hours.toFixed(2)}</div>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Punch Modal */}
      {showModal && (
        <AddPunchModal
          onClose={() => {
            setShowModal(false);
            setEditingRecord(null);
          }}
          onSubmit={handleAddPunch}
          initialData={editingRecord}
        />
      )}
    </MainLayout>
  );
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={`w-4 h-4 transform transition-transform text-black ${expanded ? 'rotate-90' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SplitIcon = () => (
  <svg className="w-4 h-4 text-white bg-emerald-600 rounded p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v8M12 12l4 4M12 12l-4 4" />
  </svg>
);
