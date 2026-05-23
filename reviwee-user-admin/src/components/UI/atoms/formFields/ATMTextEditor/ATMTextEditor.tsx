import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { ErrorMessage } from "formik";
import ATMFormLabel from "../ATMFormLabel";
import ATMTextEditorMenuBar from "./ATMTextEditorMenuBar";
import Heading from "@tiptap/extension-heading";

type Props = {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  minRows?: number;
  name?: string;
  disabled?: boolean;
};

const ATMTextEditor = ({
  label,
  required = false,
  value,
  onChange,
  className,
  placeholder = "",
  minRows = 2,
  name = "",
  disabled = false,
}: Props) => {
  const editor = useEditor({
    content: value,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc ml-3" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-3" } },
      }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      TextStyle, 
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,

      Placeholder.configure({ placeholder }),
    ],
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

 
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div>
      <ATMFormLabel label={label} required={required} disabled={disabled} />

      <div
        className={`w-full border border-[var(--divider)] rounded-[var(--radius-sm)] ${
          disabled ? "opacity-50 bg-gray-200" : "bg-white"
        } ${label ? "mt-2" : ""} ${className || ""}`}
      >
        {editor && <ATMTextEditorMenuBar editor={editor} />}
        <EditorContent
          editor={editor}
          className={`p-2 min-h-[${minRows * 25}px]`}
          style={{ boxShadow: "none" }}
        />
      </div>

      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => (
            <p className="font-poppins text-sm text-red-500 mt-1">{errMsg}</p>
          )}
        </ErrorMessage>
      )}
    </div>
  );
};

export default ATMTextEditor;
