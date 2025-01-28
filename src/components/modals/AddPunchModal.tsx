'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

// Custom Split Icon component
const SplitIcon = () => (
  <svg className="w-4 h-4 text-white bg-emerald-600 rounded p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v8M12 12l4 4M12 12l-4 4" />
  </svg>
);

interface SplitPunch {
  timeIn: string;
  timeOut: string;
  type: 'Regular' | 'Selling' | 'Non-Selling';
  break?: string | null;
  hours: string;
}

interface AddPunchModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: {
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
    splits?: SplitPunch[];
  } | null;
}

export default function AddPunchModal({ onClose, onSubmit, initialData }: AddPunchModalProps) {
  const [date, setDate] = useState(initialData?.date ? 
    (() => {
      const [month, day, year] = initialData.date.split('/');
      return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    })() : 
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [timeIn, setTimeIn] = useState(initialData?.timeIn || '9:00 AM');
  const [timeOut, setTimeOut] = useState(initialData?.timeOut || '5:00 PM');
  const [showSplitSlider, setShowSplitSlider] = useState(false);
  const [splitTime, setSplitTime] = useState('12:00');
  const [splits, setSplits] = useState<SplitPunch[]>(
    initialData?.splits && initialData.splits.length > 0
      ? initialData.splits
      : [{
          timeIn: initialData?.timeIn || '9:00 AM',
          timeOut: initialData?.timeOut || '5:00 PM',
          type: 'Regular',
          break: initialData?.break || null,
          hours: initialData?.hours?.split('/')[0] || '8.00'
        }]
  );
  const [activeTab, setActiveTab] = useState(0);
  const [splitTypes, setSplitTypes] = useState<{
    first: 'Regular' | 'Selling' | 'Non-Selling';
    second: 'Regular' | 'Selling' | 'Non-Selling';
  }>({
    first: 'Regular',
    second: 'Regular'
  });

  // Convert 12-hour format to 24-hour format
  const to24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Convert 24-hour format to 12-hour format
  const to12Hour = (time24h: string) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    
    if (hour === 0) {
      return `12:${minutes} AM`;
    } else if (hour < 12) {
      return `${hour}:${minutes} AM`;
    } else if (hour === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hour - 12}:${minutes} PM`;
    }
  };

  const calculateHours = (timeIn: string, timeOut: string): string => {
    const startTime = new Date(`2000/01/01 ${to24Hour(timeIn)}`);
    const endTime = new Date(`2000/01/01 ${to24Hour(timeOut)}`);
    const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  const handleSplit = () => {
    const splitTimeIn12Hour = to12Hour(splitTime);
    const newSplits: SplitPunch[] = [
      {
        timeIn: timeIn,
        timeOut: splitTimeIn12Hour,
        type: splitTypes.first,
        break: null,
        hours: calculateHours(timeIn, splitTimeIn12Hour)
      },
      {
        timeIn: splitTimeIn12Hour,
        timeOut: timeOut,
        type: splitTypes.second,
        break: null,
        hours: calculateHours(splitTimeIn12Hour, timeOut)
      }
    ];
    
    // Update the time states to match the splits
    setTimeIn(newSplits[0].timeIn);
    setTimeOut(newSplits[1].timeOut);
    setSplits(newSplits);
    setShowSplitSlider(false);
    setActiveTab(0);
  };

  const addSplit = () => {
    setShowSplitSlider(true);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      const newSplits = splits.filter((_, i) => i !== index);
      setSplits(newSplits);
      setActiveTab(Math.min(activeTab, newSplits.length - 1));
    }
  };

  const updateSplit = (index: number, field: keyof SplitPunch, value: string | null) => {
    const newSplits = splits.map((split, i) => {
      if (i === index) {
        return { ...split, [field]: value };
      }
      return split;
    });
    setSplits(newSplits);
  };

  const handleSubmit = () => {
    // Create date at noon to avoid timezone issues
    const selectedDate = new Date(date + 'T12:00:00');
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      timeZone: 'UTC'  // Use UTC to avoid timezone shifts
    });

    // Calculate total hours from all splits, accounting for gaps
    const totalHours = splits.reduce((sum, split) => {
      const startTime = new Date(`2000/01/01 ${to24Hour(split.timeIn)}`);
      const endTime = new Date(`2000/01/01 ${to24Hour(split.timeOut)}`);
      const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return sum + diffHours;
    }, 0);

    // Ensure we're using the selected date for the punch
    const submitData = {
      date: formattedDate,
      location: 'Store20',
      type: splits[0].type,
      timeIn: splits[0].timeIn,
      timeOut: splits[splits.length - 1].timeOut,
      break: splits[0].break,
      estOT: Math.max(totalHours - 8, 0).toFixed(2),
      hours: `${totalHours.toFixed(2)}/8.00`,
      notes: notes,
      isPending: initialData ? initialData.isPending : true,
      isManual: true,
      splits: splits.length > 1 ? splits : undefined
    };

    onSubmit(submitData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-black">
            {initialData ? 'Edit Timecard Entry' : 'New Timecard Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"
            />
          </div>

          {/* Store Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store:</label>
            <input 
              value="Store20" 
              readOnly 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"
            />
          </div>

          {/* Time Field */}
          {splits.length === 1 && !showSplitSlider && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time In:</label>
                  <input
                    type="time"
                    value={to24Hour(timeIn)}
                    onChange={(e) => setTimeIn(to12Hour(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Out:</label>
                  <input
                    type="time"
                    value={to24Hour(timeOut)}
                    onChange={(e) => setTimeOut(to12Hour(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={addSplit}
                  className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 px-2 py-1"
                >
                  <SplitIcon />
                  Split Shift
                </button>
              </div>
            </div>
          )}

          {/* Split Slider */}
          {showSplitSlider && (
            <div className="space-y-4 border rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Split time:
                </label>
                <span className="text-sm font-semibold text-emerald-600 bg-white px-3 py-1 rounded-md border border-emerald-200">
                  {to12Hour(splitTime)}
                </span>
              </div>

              <div className="relative pt-2">
                <div className="flex justify-between text-xs text-gray-500 px-2 mb-1">
                  <span>{timeIn}</span>
                  <span>{timeOut}</span>
                </div>
                <input
                  type="range"
                  min={to24Hour(timeIn).replace(':', '')}
                  max={to24Hour(timeOut).replace(':', '')}
                  value={splitTime.replace(':', '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const hours = val.slice(0, -2).padStart(2, '0');
                    const minutes = val.slice(-2);
                    setSplitTime(`${hours}:${minutes}`);
                  }}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  step="15"
                />
              </div>

              <div className="bg-white rounded-md p-3 border space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-16 font-medium text-gray-500">Split 1:</div>
                    <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded border">
                      <span className="text-gray-700">{timeIn}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-700">{to12Hour(splitTime)}</span>
                    </div>
                  </div>
                  <div className="ml-16">
                    <select 
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md text-gray-700 bg-white"
                      onChange={(e) => setSplitTypes(prev => ({ ...prev, first: e.target.value as 'Regular' | 'Selling' | 'Non-Selling' }))}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Selling">Selling</option>
                      <option value="Non-Selling">Non-Selling</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-16 font-medium text-gray-500">Split 2:</div>
                    <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded border">
                      <span className="text-gray-700">{to12Hour(splitTime)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-700">{timeOut}</span>
                    </div>
                  </div>
                  <div className="ml-16">
                    <select 
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md text-gray-700 bg-white"
                      onChange={(e) => setSplitTypes(prev => ({ ...prev, second: e.target.value as 'Regular' | 'Selling' | 'Non-Selling' }))}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Selling">Selling</option>
                      <option value="Non-Selling">Non-Selling</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSplitSlider(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSplit}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2"
                >
                  <SplitIcon />
                  Split at {to12Hour(splitTime)}
                </button>
              </div>
            </div>
          )}

          {/* Split Tabs */}
          {splits.length > 1 && (
            <div className="border rounded-md">
              <div className="flex items-center gap-1 p-1 bg-gray-50 border-b">
                {splits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      activeTab === index 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Split {index + 1}
                  </button>
                ))}
              </div>

              {/* Active Split Content */}
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Split Type:</label>
                  <select
                    value={splits[activeTab].type}
                    onChange={(e) => updateSplit(activeTab, 'type', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-700"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Selling">Selling</option>
                    <option value="Non-Selling">Non-Selling</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time In:</label>
                    <input
                      type="time"
                      value={to24Hour(splits[activeTab].timeIn)}
                      onChange={(e) => updateSplit(activeTab, 'timeIn', to12Hour(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Out:</label>
                    <input
                      type="time"
                      value={to24Hour(splits[activeTab].timeOut)}
                      onChange={(e) => updateSplit(activeTab, 'timeOut', to12Hour(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700">Break:</label>
                    <button 
                      onClick={() => updateSplit(activeTab, 'break', splits[activeTab].break ? null : '30min')}
                      className="text-emerald-600 text-sm hover:text-emerald-700"
                    >
                      {splits[activeTab].break ? 'Remove Break' : '+ Add Break'}
                    </button>
                  </div>
                  <input 
                    value={splits[activeTab].break || 'No break'} 
                    readOnly 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700"
                  />
                </div>

                {splits.length > 1 && (
                  <button
                    onClick={() => removeSplit(activeTab)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Split
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 resize-none"
              placeholder="Add any notes here..."
            />
          </div>
        </div>

        <div className="flex justify-end p-4 space-x-3 border-t bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            {initialData ? 'Save Changes' : 'Add Punch'}
          </button>
        </div>
      </div>
    </div>
  );
} 