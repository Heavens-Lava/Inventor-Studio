import { useState } from 'react';
import { BarChart3, LineChart, PieChart as PieChartIcon, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Editor } from '@tiptap/react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDialogProps {
  editor: Editor;
}

type ChartType = 'bar' | 'line' | 'pie';

interface DataPoint {
  label: string;
  value: number;
}

export function ChartDialog({ editor }: ChartDialogProps) {
  const [open, setOpen] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
    { label: 'C', value: 15 },
  ]);

  const addDataPoint = () => {
    setDataPoints([...dataPoints, { label: `Item ${dataPoints.length + 1}`, value: 0 }]);
  };

  const removeDataPoint = (index: number) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  };

  const updateDataPoint = (index: number, field: 'label' | 'value', value: string | number) => {
    const newData = [...dataPoints];
    if (field === 'label') {
      newData[index].label = value as string;
    } else {
      newData[index].value = Number(value) || 0;
    }
    setDataPoints(newData);
  };

  const getChartData = () => {
    const labels = dataPoints.map((d) => d.label);
    const values = dataPoints.map((d) => d.value);

    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
    ];

    return {
      labels,
      datasets: [
        {
          label: chartTitle || 'Dataset',
          data: values,
          backgroundColor: chartType === 'pie' ? colors : colors[0],
          borderColor: chartType === 'pie' ? colors.map((c) => c.replace('0.8', '1')) : colors[0].replace('0.8', '1'),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!chartTitle,
        text: chartTitle,
      },
    },
  };

  const insertChart = async () => {
    // Create a temporary canvas to render the chart
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Create and render the chart
    const chart = new ChartJS(ctx, {
      type: chartType,
      data: getChartData(),
      options: {
        ...chartOptions,
        animation: false,
      },
    });

    // Wait for chart to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/png');

    // Insert into editor
    editor.chain().focus().setImage({ src: imageData }).run();

    // Cleanup
    chart.destroy();

    // Reset and close
    setOpen(false);
    setChartTitle('');
    setDataPoints([
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 15 },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insert Chart">
          <BarChart3 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Chart</DialogTitle>
          <DialogDescription>
            Choose a chart type, enter your data, and insert it into your note.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left side - Configuration */}
          <div className="space-y-4">
            <div>
              <Label>Chart Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Bar
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  Line
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                >
                  <PieChartIcon className="w-4 h-4 mr-2" />
                  Pie
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="chartTitle">Chart Title</Label>
              <Input
                id="chartTitle"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title (optional)"
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Data Points</Label>
                <Button size="sm" variant="outline" onClick={addDataPoint}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-2">
                <div className="space-y-2">
                  {dataPoints.map((point, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={point.label}
                        onChange={(e) => updateDataPoint(index, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={point.value}
                        onChange={(e) => updateDataPoint(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="w-24"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDataPoint(index)}
                        disabled={dataPoints.length <= 2}
                        className="h-9 w-9 p-0"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
            <div className="w-full h-full max-h-[400px]">
              <h3 className="text-sm font-semibold mb-4 text-center">Preview</h3>
              {chartType === 'bar' && <Bar data={getChartData()} options={chartOptions} />}
              {chartType === 'line' && <Line data={getChartData()} options={chartOptions} />}
              {chartType === 'pie' && <Pie data={getChartData()} options={chartOptions} />}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={insertChart}>Insert Chart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
