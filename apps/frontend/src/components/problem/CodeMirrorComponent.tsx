"use client";

import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

import { atomoneInit } from '@uiw/codemirror-theme-atomone';


export default function Page() {
  const [value, setValue] = useState("print('hello world!');");
  const onChange = useCallback((val: string) => {
    console.log('val:', val);
    setValue(val);
  }, []);
  return <CodeMirror
    theme={atomoneInit({
      settings: {
        caret: '#c6c6c6',
        fontFamily: 'monospace',
      },

    })}

    value={value} onChange={onChange} extensions={[python()]} height='100vh'/>;
}