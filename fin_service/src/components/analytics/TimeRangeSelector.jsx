import React from "react";

const TimeRangeSelector = ({ selectedRange, setSelectedRange }) => {
  const timeRanges = [
    { id: "1M", label: "1 Month" },
    { id: "3M", label: "3 Months" },
    { id: "6M", label: "6 Months" },
    { id: "1Y", label: "1 Year" },
    { id: "ALL", label: "All Time" },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {timeRanges.map((range) => (
        <button
          key={range.id}
          onClick={() => setSelectedRange(range.id)}
          className={`px-3 py-1 text-sm rounded-md ${
            selectedRange === range.id
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;