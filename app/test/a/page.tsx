'use client'
import { Form, Button, Select, Radio, DatePicker } from 'antd';
import { useState } from 'react';

const branches = [
    { id: '1', name: 'Cabang 1' },
    { id: '2', name: 'Cabang 2' },
    { id: '3', name: 'Cabang 3' },
];

const subcategories = [
    { id: '1', name: 'Subkategori 1' },
    { id: '2', name: 'Subkategori 2' },
    { id: '3', name: 'Subkategori 3' },
];

export default function Page() {
    const [periodType, setPeriodType] = useState<any>('monthly');
    const [reportType, setReportType] = useState<any>('period'); // Default to 'period' (Arus Kas)

    const onFinish = (values: any) => {
        console.log('Report Config:', values);
        // Handle report generation logic here
    };

    return (
        <Form onFinish={onFinish} layout="vertical">
            {/* Report Type Selector */}
            <Form.Item label="Tipe Laporan" name="reportType">
                <Radio.Group
                    value={reportType}
                    onChange={(e: any) => setReportType(e.target.value)}
                >
                    <Radio value="period">Arus Kas (By Period)</Radio>
                    <Radio value="category">Berdasarkan Kategori (By Category)</Radio>
                </Radio.Group>
            </Form.Item>

            {/* Branch Selector - Common for both reports */}
            <Form.Item label="Cabang" name="cabang">
                <Select placeholder="Pilih Cabang">
                    <Select.Option value="all">Semua Cabang</Select.Option>
                    {branches.map((branch: any) => (
                        <Select.Option key={branch.id} value={branch.id}>
                            {branch.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            {/* Period Filters - Only for "Arus Kas" */}
            {reportType === 'period' && (
                <>
                    <Form.Item label="Periode Laporan" name="periodType">
                        <Radio.Group onChange={(e: any) => setPeriodType(e.target.value)}>
                            <Radio value="monthly">Bulanan</Radio>
                            <Radio value="yearly">Tahunan</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="Pilih Periode" name="period">
                        <DatePicker picker={periodType === 'monthly' ? 'month' : 'year'} />
                    </Form.Item>
                </>
            )}

            {/* Category Filters - Only for "Berdasarkan Kategori" */}
            {reportType === 'category' && (
                <Form.Item label="Kategori" name="category">
                    <Select placeholder="Pilih Kategori">
                        {subcategories.map((sub: any) => (
                            <Select.Option key={sub.id} value={sub.id}>
                                {sub.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            )}

            {/* Submit Button */}
            <Form.Item>
                <Button type="primary" htmlType="submit">Generate Report</Button>
            </Form.Item>
        </Form>
    );
};
