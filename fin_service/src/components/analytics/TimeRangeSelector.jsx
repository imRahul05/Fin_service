const TimeRangeSelector = ({ selectedRange, setSelectedRange }) => {
  const timeRanges = [
    { id: "1M", label: "1 Month" },
    { id: "3M", label: "3 Months" },
    { id: "6M", label: "6 Months" },
    { id: "1Y", label: "1 Year" },
    { id: "ALL", label: "All Time" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {timeRanges.map((range) => (
        <button
          key={range.id}
          type="button"
          onClick={() => setSelectedRange(range.id)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedRange === range.id
              ? "bg-blue-600 text-white font-medium shadow-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;