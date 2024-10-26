import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Radio, Statistic, Row, Col, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const CashFlowSummary: React.FC = () => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // Default to current year
  const [incomingTotal, setIncomingTotal] = useState<number>(0);
  const [outgoingTotal, setOutgoingTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = (e: any) => {
    setPeriod(e.target.value);
    setSelectedDate(dayjs()); // Reset to the current date when switching period
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) setSelectedDate(date);
  };

  const fetchCashFlowData = async () => {
    setLoading(true);
    try {
      const date = selectedDate.format(period === 'monthly' ? 'YYYY-MM' : 'YYYY');
      const response = await fetch(`/api/finance/cashflow/summary?date=${date}&period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cash flow data');
      }

      const data = await response.json();
      setIncomingTotal(data.incomingTotal);
      setOutgoingTotal(data.outgoingTotal);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlowData();
  }, [selectedDate, period]);

  return (
    <Card title="Ringkasan Arus Kas" loading={loading}>
      <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Radio.Group value={period} onChange={handlePeriodChange}>
            <Radio.Button value="monthly">Bulanan</Radio.Button>
            <Radio.Button value="yearly">Tahunan</Radio.Button>
          </Radio.Group>
        </Col>
        <Col>
          <DatePicker
            picker={period === 'monthly' ? 'month' : 'year'}
            onChange={handleDateChange}
            value={selectedDate}
            format={period === 'monthly' ? 'MMMM YYYY' : 'YYYY'}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="Total Kas Masuk" value={incomingTotal} prefix="Rp" precision={0}/>
        </Col>
        <Col span={12}>
          <Statistic title="Total Kas Keluar" value={outgoingTotal} prefix="Rp" precision={0}/>
        </Col>
      </Row>
    </Card>
  );
};

export default CashFlowSummary;
