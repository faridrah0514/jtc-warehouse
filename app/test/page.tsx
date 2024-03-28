// 'use client'
// import { Button, Form, GetProp, Upload, UploadFile, UploadProps, message } from 'antd'
// import React, { useRef, useState } from 'react'
// import { UploadOutlined } from '@ant-design/icons'

// type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]
// interface FileItem {
//   uid: string,
//   name: string,
//   status: 'uploading' | 'done' | 'error',
//   url: string | null
// }

// export default function Page() {
//   const [fileList, setFileList] = useState<UploadFile[]>([]);
//   const [uploading, setUploading] = useState(false);

//   function handleUpload() {
//     const formData = new FormData()
//     fileList.forEach(
//       (file) => {
//         formData.append('files[]', file as FileType)
//       }
//     )
//     setUploading(true)
//     fetch('/api/master/aset/upload', {
//       method: 'POST',
//       body: formData
//     }).then((res) => res.json())
//     .then((res) => {
//       setFileList([])
//       if(res.status == 200) {
//         message.success("upload success")
//       } else {
//         message.error("upload failed")
//       }

//     })
//     .catch(() => message.error("upload failed"))
//     .finally(() => setUploading(false))
//   }


//   const props: UploadProps = {
//     onRemove: (file) => {
//       const index = fileList.indexOf(file)
//       const newFileList = fileList.slice()
//       newFileList.splice(index, 1)
//       setFileList(newFileList)
//     },
//     beforeUpload: (file) => {
//       setFileList([...fileList, file])
//       return false
//     },
//     fileList

//   }
//   return (
//     <>
//       <Form onFinish={handleUpload}>
//         <Form.Item name='upload'>
//           <Upload {...props}>
//             <Button icon={<UploadOutlined />}>Upload</Button>
//           </Upload>
//         </Form.Item>
//         <Form.Item>
//           <Button htmlType='submit' type='primary' loading={uploading}>
//             {uploading ? 'Uploading': 'Start Uploading'}
//           </Button>
//         </Form.Item>
//       </Form>

//     </>
//   )
// }
'use client'
import { Button, Flex, Form, Input, Upload, UploadFile } from 'antd';
import React, { useState } from 'react'

export default function Page() {

  function handleInputchange(index: number, e: string) {
    const newInput = [...input]
    newInput[index] = e
    setInput(newInput)
  }

  const [input, setInput] = useState<string[]>([])
  const [fileList, setFileList] = useState<UploadFile[][]>([])
  return (<Form>
    {input.map(
      (i, index) => {
        return (
          <div key={index} className='flex gap-2 mb-2'>
            {/* <Form.Item> */}
            <Input value={i} onChange={(e) => handleInputchange(index, e.target.value)}></Input>
            <Upload
              onRemove={(file) => {
                setFileList(
                  fileList.map(
                    (v, i) => {
                      if (i == index) {
                        return v.filter(
                          (k,j) => file.uid !== k.uid && file.name !== k.name
                        )
                      } 
                      return v
                    } 
                  )
                )
              }}
              beforeUpload={(file) => {
                setFileList(
                  fileList.map(
                    (v, i) => { 
                      if (i == index) {
                        return [...v, file]
                      } return v
                    }
                  )
                )
                return false
              }} >
              <Button onClick={() => {
  
                

                            }}>Upload</Button>
            </Upload>
            <Button
              onClick={(j) => {
                const jadi = input.filter((_, i) => i !== index)    
                setInput(jadi)
              }}
            >Delete</Button>
            {/* </Form.Item> */}
          </div>
        )
      }
    )}
    <Button onClick={
      () => {
        setInput([...input, ''])
        setFileList([...fileList, []])
      }
      
      }>ADD</Button>
  </Form>);
}
