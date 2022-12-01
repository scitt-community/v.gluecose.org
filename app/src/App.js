


import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import AppPage from './AppPage'

import FileUploader from './FileUploader'
import JSONView from './JSONView'

import { green, blue } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import example from './services/example.json'
import cose from './services/cose'
import { useState } from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: blue,
    secondary: green
  }
});

function App() {
  const [object, setObject] = useState(null)

  const handleFilesAccepted = async (files) =>{
    const [file] = files;
    if (file.type === 'application/json'){
      const content = new TextDecoder().decode(await file.arrayBuffer());
      const testCase = JSON.parse(content)
      if (testCase?.output?.cbor){
        const cborObject = await cose.loadFromHex(example.output.cbor) 
        console.log('cborObject', cborObject)
        setObject(cborObject)
      }
    }
  }
  return (

    <ThemeProvider theme={theme}>
      <ToastContainer position="bottom-right" />
      <AppPage>

        <Typography paragraph>
          This web application provides an easy way to share and view cose object in a "jose like" JSON view.
        </Typography>

        <Typography paragraph>
          You can obtain examples from <Link href="https://github.com/cose-wg/Examples/tree/master/ecdsa-examples">cose-wg/Examples</Link>.
        </Typography>

        <Typography paragraph>
          Currently only COSE_Sign1 is supported.
        </Typography>

        <FileUploader onFilesAccepted={handleFilesAccepted}/>
       
        {object && <Box sx={{mt: 2}}>
          <JSONView value={object} />
        </Box>}
    </AppPage>
    </ThemeProvider>
    
  );
}

export default App;
