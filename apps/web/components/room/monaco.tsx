"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  readonly code: string;
  readonly onChange: (value: string) => void;
}

export function MonacoEditor({ code, onChange }: CodeEditorProps) {
  return (
    <div
      style={{
        width: "80%",
        margin: "0 auto",
      }}
    >
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) =>
        {
          if (!value) return;
          onChange(value);
        }}
      />
    </div>
  );
}