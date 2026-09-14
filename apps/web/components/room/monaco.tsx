"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Terminal } from "lucide-react";

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
      await new Promise((resolve) => setTimeout(resolve, 600));
      setOutput("Still Under Construction");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="room-workspace">
      <section className="room-editor-pane">
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
            editor.onDidChangeCursorPosition((event) => {
              if (onCursorChange) {
                onCursorChange(event.position.lineNumber, event.position.column);
              }
            });
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </section>

      <aside className="room-output-pane">
        <div className="room-output-header">
          <div>
            <span className="eyebrow">Live workspace</span>
            <h2>Console</h2>
          </div>
          <Terminal size={18} />
        </div>
        <button className="primary-button room-run-button" onClick={runCode} disabled={isRunning}>
          <Play size={16} />
          <span>{isRunning ? "Running" : "Run Code"}</span>
        </button>

        <pre className={output ? "room-output active" : "room-output"}>
          {output || "Output will appear here..."}
        </pre>
      </aside>
    </div>
  );
}
