import type { JSX } from "react";

import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

import { editorHighlighting, editorTheme } from "../../lib/editor-theme";
import { mermaidLanguage } from "../../lib/mermaid-language";

export interface SourceEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
}

const BASE_EXTENSIONS = [
  mermaidLanguage,
  editorHighlighting,
  editorTheme,
  EditorView.lineWrapping,
];

/** CodeMirror editor; loaded lazily because of its size. */
export default function SourceEditor({
  value,
  onChange,
  label,
}: SourceEditorProps): JSX.Element {
  return (
    <CodeMirror
      value={value}
      height="100%"
      theme="none"
      className="h-full"
      extensions={[
        ...BASE_EXTENSIONS,
        EditorView.contentAttributes.of({ "aria-label": label }),
      ]}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        autocompletion: false,
        closeBrackets: true,
        bracketMatching: true,
        searchKeymap: false,
      }}
      onChange={onChange}
    />
  );
}
