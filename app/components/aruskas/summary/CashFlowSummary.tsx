import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Radio, Statistic, Row, Col, Divider, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const CashFlowSummary: React.FC = () => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [incomingTotal, setIncomingTotal] = useState<number>(0);
  const [outgoingTotal, setOutgoingTotal] = useState<number>(0);
  const [remainingBefore, setRemainingBefore] = useState<number>(0);
  const [remainingAfter, setRemainingAfter] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = (e: any) => {
    setPeriod(e.target.value);
    setSelectedDate(dayjs());
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
      setRemainingBefore(data.remainingBefore);
      setRemainingAfter(data.remainingAfter);
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
    <Card 
      title="Ringkasan Arus Kas" 
      loading={loading}
      style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
    >
      <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
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

      {/* Starting Balance */}
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col>
          <Statistic
            title="Saldo Sebelum"
            value={remainingBefore}
            prefix={<WalletOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ fontSize: '1.5em', color: '#1890ff' }}
            precision={0}
          />
        </Col>
      </Row>

      <Divider />

      {/* Income and Expenses */}
      <Row gutter={16} justify="space-around" style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card bordered={false} style={{ textAlign: 'center', borderRadius: '8px', backgroundColor: '#e6f7ff' }}>
            <Statistic
              title="Total Kas Masuk"
              value={incomingTotal}
              prefix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
              valueStyle={{ color: '#3f8600', fontSize: '1.2em' }}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false} style={{ textAlign: 'center', borderRadius: '8px', backgroundColor: '#fff1f0' }}>
            <Statistic
              title="Total Kas Keluar"
              value={outgoingTotal}
              prefix={<ArrowDownOutlined style={{ color: '#cf1322' }} />}
              valueStyle={{ color: '#cf1322', fontSize: '1.2em' }}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Ending Balance */}
      <Row justify="center">
        <Col>
          <Statistic
            title="Saldo Setelah"
            value={remainingAfter}
            prefix={<WalletOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ fontSize: '1.5em', color: '#1890ff' }}
            precision={0}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default CashFlowSummary;
