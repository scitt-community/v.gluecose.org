import React from 'react';

import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-pastel_on_dark';

const JsonViewReadOnly = ({ value }) => {
  return (
    <AceEditor
      style={{ width: '100%' }}
      mode="json"
      theme="pastel_on_dark"
      wrapEnabled={true}
      readOnly={true}
      value={JSON.stringify(value, null, 2)}
      editorProps={{ $blockScrolling: true, useWorker: false }}
    />
  );
};

export default JsonViewReadOnly;