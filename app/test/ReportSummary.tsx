import React from 'react';

interface ReportSummaryProps {
  total: number;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ total }) => {
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Total: {total}</h3>
    </div>
  );
};
