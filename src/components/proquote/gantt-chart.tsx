'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useMemo } from 'react';
import {
  parse,
  differenceInDays,
  startOfYear,
  addDays,
  format,
} from 'date-fns';

interface GanttChartProps {
  timeline: string;
}

interface Task {
  name: string;
  start: Date;
  end: Date;
}

interface ChartData {
  name: string;
  startDay: number;
  duration: number;
  range: string;
}

const parseTimeline = (timeline: string): Task[] => {
  const lines = timeline.split('\n').filter((line) => line.trim() !== '');
  const tasks: Task[] = [];
  const regex = /(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})\s*to\s*(\d{4}-\d{2}-\d{2})/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const [, name, startStr, endStr] = match;
      const startDate = parse(startStr, 'yyyy-MM-dd', new Date());
      const endDate = parse(endStr, 'yyyy-MM-dd', new Date());

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        tasks.push({ name: name.trim(), start: startDate, end: endDate });
      }
    }
  }
  return tasks;
};

export function GanttChart({ timeline }: GanttChartProps) {
  const { chartData, error } = useMemo(() => {
    try {
      const tasks = parseTimeline(timeline);
      if (tasks.length === 0) {
        return { chartData: null, error: 'No valid tasks found in the timeline data. Please check the format (Task - YYYY-MM-DD to YYYY-MM-DD).' };
      }

      const projectStartDate = tasks.reduce(
        (min, task) => (task.start < min ? task.start : min),
        tasks[0].start
      );

      const data: ChartData[] = tasks.map((task) => ({
        name: task.name,
        startDay: differenceInDays(task.start, projectStartDate),
        duration: differenceInDays(task.end, task.start) + 1,
        range: `${format(task.start, 'MMM d')} - ${format(task.end, 'MMM d')}`,
      }));

      return { chartData: data.reverse(), error: null }; // Reverse for top-to-bottom display
    } catch (e) {
      console.error('Gantt chart parsing error:', e);
      return { chartData: null, error: 'Failed to parse timeline data.' };
    }
  }, [timeline]);

  if (error || !chartData) {
    return (
      <div className="p-4 border border-dashed rounded-lg text-center">
        <p className="text-muted-foreground">{error}</p>
        <pre className="mt-4 text-sm text-left bg-muted p-4 rounded-md overflow-x-auto">
          {timeline}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: chartData.length * 50 + 60 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis type="number" domain={['dataMin', 'dataMax']} hide/>
          <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{fill: 'rgba(240, 240, 240, 0.5)'}}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-card p-2 border rounded-md shadow-lg">
                    <p className="font-bold">{`${payload[0].payload.name}`}</p>
                    <p>{`Timeline: ${payload[0].payload.range}`}</p>
                    <p>{`Duration: ${payload[0].payload.duration} days`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="startDay" stackId="a" fill="transparent" />
          <Bar dataKey="duration" stackId="a" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
