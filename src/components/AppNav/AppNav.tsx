import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ShareIcon from '@mui/icons-material/Share';
import { useRouter } from 'next/navigation';
import {toast} from 'react-toastify'

export default function AppNav({hex}: {hex: string}) {
  const router = useRouter()
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Copied URL')
  }
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={()=>{router.push('/')}}>
            EDN Preview
          </Typography>
          <Button color="inherit" href='https://github.com/scitt-community/v.gluecose.org' target='_blank'>Source</Button>
          <Button color="inherit" href={`https://cbor.me/?bytes=${hex}`} target='_blank'>CBOR.me</Button>
          <Button color="primary" onClick={handleShare} endIcon={<ShareIcon/>} variant='contained'>Share</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
