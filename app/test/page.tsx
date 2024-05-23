'use client'
import React, { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'; // Import dynamic from next/dynamic
import { DatePicker, Image, Tabs } from 'antd';
const { RangePicker } = DatePicker;
import dayjs from 'dayjs';

const dateFormat = 'YYYY/MM/DD';

export default function page() {
  return (
    <>
      <RangePicker></RangePicker>
      <RangePicker
      defaultValue={[dayjs('2015/01/01', dateFormat), dayjs('2015/01/01', dateFormat)]}
      format={dateFormat}
    />
    </>
  )
}

