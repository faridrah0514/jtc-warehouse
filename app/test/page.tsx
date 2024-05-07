'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'; // Import dynamic from next/dynamic
import { Image, Tabs } from 'antd';
export default function page() {
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(true);

  useEffect(
    () => {
      async function getData() {
        const response = await fetch('/api/master/test', { method: 'GET', cache: 'no-store' })
        const data = await response.json()
      }
      getData()
    }, [triggerRefresh]
  )
  return (
    <div className='w-screen h-screen overflow-hidden'>
      <Tabs
        tabPosition='left'
        items={[
          {
            label: 'test-0',
            key: '0',
            children: <iframe
              src='/upload/docs/CB-0016-AS-0111/PDF/dzikir-pagi-slide.pdf'
              className="w-screen h-screen" // Set iframe width and height to fill the container
              // style={{ minHeight: '800px' }} // Set minimum height to prevent collapse
            // frameBorder="0" // Hide iframe border
            ></iframe>
          },
          // {
          //   label: 'test-1',
          //   key: '1',
          //   children: <img
          //     src='/docs/AS-0097/ll/neutrophil-image.jpg'
          //     // className="overflow-auto"  // Ensure the image covers the container
          //     alt="Neutrophil Image"
          //   />
          // },
        ]}
      >
      </Tabs>
    </div>
  )
}

