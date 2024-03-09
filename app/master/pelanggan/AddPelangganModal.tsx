import { Modal } from 'antd'
import React from 'react'

interface Status  {
    openModal: boolean,
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddPelangganModal( props : Status) {
    // console.log("dari modal nih")
    // console.log("status modal: ", props.openModal)
  return (
    <Modal onOk={() => {props.setOpenModal(false)}} open={props.openModal} onCancel={() => props.setOpenModal(false)}>
        <p>test sebiiji</p>
    </Modal>
  )
}
