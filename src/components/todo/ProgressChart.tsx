import { Task } from "@/types/todo";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval } from "date-fns";

interface ProgressChartProps {
  tasks: Task[];
}

export const ProgressChart = ({ tasks }: ProgressChartProps) => {
  // Get current week data
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate completed tasks per day
  const weekData = daysOfWeek.map(day => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const completedCount = tasks.filter(task =>
      task.status === "completed" &&
      task.completedAt &&
      isWithinInterval(new Date(task.completedAt), { start: dayStart, end: dayEnd })
    ).length;

    return {
      day: format(day, "EEE"),
      completed: completedCount,
      date: format(day, "MMM d")
    };
  });

  // Calculate category distribution
  const categoryData = Object.entries(
    tasks
      .filter(t => t.status === "completed")
      .reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
  ).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Weekly Completion Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.date}</p>
                      <p className="text-sm text-blue-600">
                        {payload[0].value} tasks completed
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Tasks by Category</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.category}</p>
                      <p className="text-sm text-green-600">
                        {payload[0].value} tasks
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
