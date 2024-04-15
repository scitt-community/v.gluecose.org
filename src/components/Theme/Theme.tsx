"use client"

import * as React from 'react';


import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


import { teal, deepPurple } from '@mui/material/colors';


export const theme = createTheme({
  palette: {
    mode:'dark',
    primary: {
      main: deepPurple.A200
    },
    secondary: teal
  },
});

export default function CustomTheme({children}:any) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}