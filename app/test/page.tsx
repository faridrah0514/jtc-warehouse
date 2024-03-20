'use client'
import { Button, Form, GetProp, Upload, UploadFile, UploadProps, message } from 'antd'
import React, { useRef, useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]
interface FileItem {
  uid: string,
  name: string,
  status: 'uploading' | 'done' | 'error',
  url: string | null
}

export default function Page() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleUpload() {
    const formData = new FormData()
    fileList.forEach(
      (file) => {
        formData.append('files[]', file as FileType)
      }
    )
    setUploading(true)
    fetch('/api/master/aset/upload', {
      method: 'POST',
      body: formData
    }).then((res) => res.json())
    .then((res) => {
      setFileList([])
      if(res.status == 200) {
        message.success("upload success")
      } else {
        message.error("upload failed")
      }
      
    })
    .catch(() => message.error("upload failed"))
    .finally(() => setUploading(false))
  }


  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file])
      return false
    },
    fileList

  }
  return (
    <>
      <Form onFinish={handleUpload}>
        <Form.Item name='upload'>
          <Upload {...props}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' type='primary' loading={uploading}>
            {uploading ? 'Uploading': 'Start Uploading'}
          </Button>
        </Form.Item>
      </Form>

    </>
  )
}
