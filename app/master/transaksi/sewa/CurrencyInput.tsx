import React from 'react';
import { Input } from 'antd';
// import 'antd/dist/antd.css';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    onChange(value);
  };

  // Formatter function to format the input value as currency
  const formatCurrency = (value: string) => {
    if (!value) return '';
    const floatValue = parseFloat(value.replace(/[^\d.]/g, ''));
    return floatValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Parser function to convert the formatted currency back to a float
  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^\d.]/g, ''));
  };

  return (
    <Input
      value={value}
      onChange={handleInputChange}
      placeholder="Enter amount"
      // Casting the Input component to include formatter and parser props
      {...({ formatter: formatCurrency, parser: parseCurrency } as any)}
    />
  );
};

export default CurrencyInput;
