import React from "react";
import { Card } from "../../components/ui/card";

const ChartSection = ({ data, title, description }) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      <div className="h-64 w-full">
        {/* Chart visualization would go here */}
        {/* This is a placeholder for actual chart implementation */}
        <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500">
            {data && data.length > 0 
              ? "Chart visualization (to be implemented with a chart library)" 
              : "No data available for chart visualization"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ChartSection;