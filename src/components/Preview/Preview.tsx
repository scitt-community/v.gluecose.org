"use client"

import * as React from 'react';

import { Box, TextField } from '@mui/material'

import * as edn from '@transmute/edn'
import Fragment from '../../services/Fragment';
import FileUploader from '../FileUploader';

import { useRouter } from 'next/navigation';

import AppNav from '../AppNav';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { diagnose } from 'cbor';

export default function Preview() {
  const router = useRouter();
  const [hexString, setHexString] = React.useState('')
  const [ednString, setEdnString] = React.useState('')

  const handleHexChange = async (event: React.ChangeEvent & { target: { value: string } }) => {
    if (event.target) {
      setHexString(event.target.value)
    }
  }

  const handleFilesAccepted = async (files: File[]) => {
    const [file] = files
    const data = await file.arrayBuffer()
    const hexString = Buffer.from(data).toString('hex')
    setHexString(hexString)
  }

  React.useEffect(() => {
    (async () => {
      try {
        const readOnly = window.location.hash.length > 0
        if (hexString.length > 0) {
          const data = Buffer.from(hexString, 'hex')
          try{
            const diag = await edn.render(data, 'application/cbor-diagnostic')
            setEdnString(diag)
          } catch(e){
            // not very well supported yet
            // so we expect many errors
            const diag = await diagnose(data)
            setEdnString(diag)
          }
          
          const hash = await Fragment.set(data)
          if (hash) {
            router.push(hash)
          }
        }
        if (readOnly && hexString.length === 0) {
          const data = await Fragment.get(window.location.hash)
          setHexString(Buffer.from(data).toString('hex'))
        }
      } catch (e) {
        toast.error("Something went wrong.")
      }

    })()
  }, [router, hexString])

  return (
    <Box>
      <AppNav hex={hexString}/>
      <Box sx={{ p: 2 }}>
          <FileUploader onFilesAccepted={handleFilesAccepted} dragText={<>{`Drag a ".cbor" file here.`}</>} dropText={<>{`Drop file.`}</>} />
        </Box>
      <Box sx={{ p: 2 }}>
        <TextField
          label="Paste hex here"
          placeholder="D28444A1013823A104423131545468697..."
          fullWidth
          multiline
          variant='filled'
          value={hexString}
          onChange={handleHexChange}
        />
        
        {ednString.length > 0 && <Box sx={{ mt: 4 }}>
          <TextField
            label="Extended Diagnostic Notation (EDN)"
            fullWidth
            multiline
            disabled
            value={ednString}
          />
        </Box>}
        <ToastContainer theme='dark' />
      </Box></Box>

  );
}