import React from 'react'

import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-pastel_on_dark'

const CborDiagnosticView = ({ value, sx }) => {
  if (!value) {
    return <></>
  }
  return (
    <AceEditor
      style={{ width: '100%', height: '100%', ...sx }}
      mode="text"
      theme="pastel_on_dark"
      wrapEnabled={true}
      readOnly={true}
      value={value}
      editorProps={{ $blockScrolling: true, useWorker: false }}
    />
  )
}

export default CborDiagnosticView
