"use client";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { atomoneInit } from "@uiw/codemirror-theme-atomone";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function Page({ value, onChange }: Props) {

  return (
    <div className="bg-[#282c34]">
      <CodeMirror
        className="min-h-112 text-left"
        theme={atomoneInit({
          settings: {
            caret: "#c6c6c6",
            fontFamily: "monospace",
          },
        })}
        value={value}
        onChange={onChange}
        extensions={[python()]}
        height="min(60vh, 42rem)"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          autocompletion: true,
        }}
      />
    </div>
  );
}