import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { formatDate } from '@/utils/dateUtils';
import { DEFAULT_CATEGORIES } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle2, Clock } from 'lucide-react';

const AnalyticsView = () => {
  const { timeBlocks } = useTimeBlocks();
  const today = formatDate(new Date());

  const stats = useMemo(() => {
    const todayBlocks = timeBlocks.filter(b => b.date === today);
    
    // Category distribution
    const categoryData = DEFAULT_CATEGORIES.map(cat => {
      const blocks = todayBlocks.filter(b => b.category === cat.id);
      const minutes = blocks.reduce((acc, b) => {
        const start = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1]);
        const end = parseInt(b.endTime.split(':')[0]) * 60 + parseInt(b.endTime.split(':')[1]);
        return acc + (end - start);
      }, 0);
      return {
        name: cat.name,
        value: minutes,
        color: cat.color,
      };
    }).filter(d => d.value > 0);

    // Completion stats
    const completedBlocks = todayBlocks.filter(b => b.completed).length;
    const totalBlocks = todayBlocks.length;
    const completionRate = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

    // Sub-tasks stats
    const totalSubTasks = todayBlocks.reduce((acc, b) => acc + b.subTasks.length, 0);
    const completedSubTasks = todayBlocks.reduce((acc, b) => 
      acc + b.subTasks.filter(st => st.completed).length, 0
    );

    return {
      categoryData,
      completedBlocks,
      totalBlocks,
      completionRate,
      totalSubTasks,
      completedSubTasks,
    };
  }, [timeBlocks, today]);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-4 pb-20 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Riepilogo</h1>
        <p className="text-sm text-muted-foreground">Analisi della tua giornata</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attività Completate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {stats.completedBlocks}/{stats.totalBlocks}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.completionRate.toFixed(0)}%
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sotto-task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {stats.completedSubTasks}/{stats.totalSubTasks}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completati
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Distribution Chart */}
      {stats.categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione del Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatMinutes(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {stats.categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <span className="font-medium">{formatMinutes(cat.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.categoryData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nessuna attività per oggi.
              <br />
              Inizia a pianificare la tua giornata!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsView;
