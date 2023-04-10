import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ExitToApp } from '@mui/icons-material'
import AppPage from './AppPage'

import FileUploader from './FileUploader'

import CborDiagnosticView from './CborDiagnosticView'
import { green, blue } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'
import { ThemeProvider } from '@emotion/react'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { useEffect, useState } from 'react'

import cose from './services/cose'
import uri from './services/uri'

import { prettyDiagnostic } from './prettyDiagnostic'
import { alternateDiagnostic } from './alternateDiagnostic'

import CoseAccordion from './CoseAccordion'
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: blue,
    secondary: green,
  },
})

function App() {
  const [pretty, setPretty] = useState(null)
  const [diagnostic, setDiagnostic] = useState(null)
  const [unprotectedHeader, setUnprotectedHeader] = useState(null)
  const [protectedHeader, setProtectedHeader] = useState(null)
  const [payload, setPayload] = useState(null)

  const handleUpdate = async (coseData) => {
    await uri.handleUriUpdate(coseData)
    const diagnostic = await prettyDiagnostic(coseData)
    const alt = await alternateDiagnostic(coseData)
    setPretty(alt)
    setDiagnostic(diagnostic)
    const parsed = await cose.loadFromArrayBuffer(coseData)
    setUnprotectedHeader(parsed.unprotectedHeader)
    setProtectedHeader(parsed.protectedHeader)
    setPayload(parsed.payload)
  }

  const handleFilesAccepted = async (files) => {
    const [file] = files
    let coseData
    if (file.type === 'application/json') {
      const content = new TextDecoder().decode(await file.arrayBuffer())
      const testCase = JSON.parse(content)
      if (testCase?.output?.cbor) {
        coseData = cose.hexToArrayBuffer(testCase.output.cbor)
        handleUpdate(coseData)
      } else {
        toast.error(
          'Unsupported JSON example. See https://github.com/cose-wg/Examples.'
        )
      }
    } else if (file.path.endsWith('.cose')) {
      coseData = await file.arrayBuffer()
      handleUpdate(coseData)
    }
  }

  useEffect(() => {
    if (window.location.hash.startsWith('#pako:')) {
      ;(async () => {
        const coseData = await uri.getCoseDataFromFragment(window.location.hash)
        handleUpdate(coseData)
      })()
    }
  }, [])
  return (
    <ThemeProvider theme={theme}>
      <ToastContainer position="bottom-right" />
      <AppPage>
        <Box sx={{ mb: 2 }}>
          <FileUploader
            onFilesAccepted={handleFilesAccepted}
            dragText={`Drag a ".json" or ".cose" file here to view.`}
            dropText={`Drop the file.`}
          />
        </Box>

        {diagnostic && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Typography>Diagnostic</Typography>
              <CborDiagnosticView value={pretty} sx={{ display: 'flex' }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Typography sx={{ flexGrow: 1 }}>COSE </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color={'secondary'}
                  onClick={() => {
                    window.open(
                      `https://cbor.me/?diag=${encodeURIComponent(diagnostic)}`
                    )
                  }}
                  endIcon={<ExitToApp />}
                >
                  CBOR.me
                </Button>
              </Box>
              <CoseAccordion
                unprotectedHeader={unprotectedHeader}
                protectedHeader={protectedHeader}
                payload={payload}
              />
            </Grid>
          </Grid>
        )}
      </AppPage>
    </ThemeProvider>
  )
}

export default App
