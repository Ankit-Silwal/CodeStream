"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  readonly code: string;
  readonly onChange: (value: string) => void;
  readonly onCursorChange?: (line: number, column: number) => void;
}

export function MonacoEditor({ code, onChange, onCursorChange }: CodeEditorProps) {
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 600));
      setOutput("Still Under Construction");
    } finally {
      setIsRunning(false);
    }
  };
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "70%" }}>
        <Editor
          height="100vh"
          theme="vs-dark"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => {
            if (value !== undefined) {
              onChange(value);
            }
          }}
          onMount={(editor) => {
            editor.onDidChangeCursorPosition((e) => {
              if (onCursorChange) {
                onCursorChange(e.position.lineNumber, e.position.column);
              }
            });
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>

      <div
        style={{
          width: "30%",
          borderLeft: "1px solid #30363d",
          padding: "12px",
          background: "#0d1117",
          color: "#e6edf3",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={runCode}
          disabled={isRunning}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            background: isRunning ? "#2ea043" : "#238636",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isRunning ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: isRunning ? 0.7 : 1,
            transition: "all 0.2s ease-in-out",
          }}
        >
          {isRunning ? "Running..." : "▶ Run Code"}
        </button>

        <div
          style={{
            flex: 1,
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "10px",
            overflowY: "auto",
            fontSize: "13px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            color: output ? "#e6edf3" : "#8b949e",
          }}
        >
          {output || "Output will appear here..."}
        </div>
      </div>
    </div>
  );
}