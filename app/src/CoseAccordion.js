import * as React from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import JSONView from './JSONView'

export default function CoseAccordion({
  unprotectedHeader,
  protectedHeader,
  payload,
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography>Protected Header</Typography>
        <JSONView value={protectedHeader} sx={{ height: 128 }} />
      </Grid>
      {JSON.stringify(unprotectedHeader) !== '{}' && (
        <Grid item xs={12}>
          <Typography>Unprotected Header</Typography>
          <JSONView value={unprotectedHeader} sx={{ height: 128 }} />
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography>Protected Payload</Typography>
        <JSONView value={payload} sx={{ display: 'flex' }} />
      </Grid>
    </Grid>
  )
}
