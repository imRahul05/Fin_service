import { Card } from "../../components/ui/card";

const ChartSection = ({ data, title, description }) => {
  return (
    <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40">
      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>

      <div className="h-64 w-full">
        <div className="h-full w-full bg-gray-100 dark:bg-gray-700/50 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
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