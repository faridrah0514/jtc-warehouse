// MeteranAkhirInput.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { Form, Input } from 'antd';

interface MeteranAwalProps {
  meteranAwal: number | undefined;
  onChange: (value: number) => void;
}

const MeteranAwalInput: React.FC<MeteranAwalProps> = ({ meteranAwal, onChange }) => {
  const [a, setA] = useState<number|undefined>(0)
  useEffect(
    () => {
      console.log("bijii")
      console.log("meteran Awal: ", meteranAwal)
      setA(meteranAwal)
    }
  )
  return (
    <Form.Item
      name='meteran_awal'
      label="Meteran awal"
      rules={[{ required: true, message: 'Please input a number!' }]}
      initialValue={meteranAwal}
    >
      <Input
        placeholder={meteranAwal !== undefined ? String(a) : 'Meteran Akhir'}
        autoComplete='off'
        value={meteranAwal!== undefined ? String(a) : ''}
        onChange={(e) => {
          const value = Number(e.target.value);
          onChange(value);
        }}
      />
    </Form.Item>
  );
};

export default MeteranAwalInput;