import React, { useEffect, useState } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { BarChart, BarSeries } from '@mui/x-charts/BarChart';
import type { AxisScaleType } from '@mui/x-charts/models/axis';

type SessionAttendance = {
  sessionDate: string;
  attended: number;
  absent: number;
};

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
}));

const AttendanceBarChart: React.FC = () => {
  const [data, setData] = useState<SessionAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/attendanceStats')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json: SessionAttendance[]) => {
        setData(json);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load attendance data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Typography align="center">Loading attendance…</Typography>;
  }
  if (error) {
    return <Typography color="error" align="center">{error}</Typography>;
  }
  if (data.length === 0) {
    return <Typography align="center">No attendance data available</Typography>;
  }

  const labels = data.map(d =>
    new Date(d.sessionDate).toLocaleDateString()
  );
  const attendedCounts = data.map((d) => d.attended);
  const absentCounts = data.map((d) => d.absent);

  const series: BarSeries[] = [
    { data: attendedCounts, label: 'Attended' },
    { data: absentCounts, label: 'Absent' },
  ];
  const xAxis = [
    { data: labels, scaleType: 'band' as AxisScaleType, label: 'Date' },
  ];
  const yAxis = [{ label: 'Number of Students' }];

  return (
    <ChartContainer>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Attendance by Date
      </Typography>
      <Box sx={{ height: 400, width: '100%' }}>
        <BarChart
          series={series}
          xAxis={xAxis}
          yAxis={yAxis}
          height={400}
          sx={{ width: '100%' }}
        />
      </Box>
    </ChartContainer>
  );
};

export default AttendanceBarChart;