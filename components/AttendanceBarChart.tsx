// By Kanghuan Xu
// npm install @mui/material @emotion/react @emotion/styled @mui/x-charts

import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { BarChart, BarSeries } from '@mui/x-charts/BarChart';
import type { AxisScaleType } from '@mui/x-charts/models/axis';

interface AttendanceEntry {
  date: string;
  count: number;
}

interface AttendanceBarChartProps {
  attendanceData: AttendanceEntry[];
}

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
}));

const AttendanceBarChart: React.FC<AttendanceBarChartProps> = ({ attendanceData }) => {
  const labels: string[] = attendanceData.map((entry) => entry.date);
  const values: number[] = attendanceData.map((entry) => entry.count);

  const series: BarSeries[] = [
    { data: values, label: 'Attendees' },
  ];

  const xAxis = [
    { data: labels, scaleType: 'band' as AxisScaleType, label: 'Date' },
  ];
  const yAxis = [
    { label: 'Count' },
  ];

  return (
    <ChartContainer>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: 600 }}>
        Attendance Overview
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
