import React, { useRef, useEffect } from 'react';
import MonacoEditor, { Monaco, OnChange, OnMount } from '@monaco-editor/react';

export interface CodeEditorProps {
  value: string;
  language: string;
  theme?: 'vs-dark' | 'light';
  fontSize?: number;
  minimap?: boolean;
  onChange?: (value: string | undefined) => void;
  onCursorChange?: (position: any) => void;
  onSelectionChange?: (selection: any) => void;
  options?: Record<string, any>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  theme = 'vs-dark',
  fontSize = 16,
  minimap = true,
  onChange,
  onCursorChange,
  onSelectionChange,
  options = {},
}) => {
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition(e => {
      onCursorChange?.(e.position);
    });
    editor.onDidChangeCursorSelection(e => {
      onSelectionChange?.(e.selection);
    });
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize, minimap: { enabled: minimap }, ...options });
    }
  }, [fontSize, minimap, options]);

  return (
    <MonacoEditor
      height="80vh"
      defaultLanguage={language}
      value={value}
      theme={theme}
      onChange={onChange}
      onMount={handleMount}
      options={{
        fontSize,
        minimap: { enabled: minimap },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        ...options,
      }}
    />
  );
};

export default CodeEditor; 