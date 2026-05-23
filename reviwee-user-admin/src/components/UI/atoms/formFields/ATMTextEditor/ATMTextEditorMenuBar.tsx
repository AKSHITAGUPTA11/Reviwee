import React, { useEffect, useState } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiList,
  FiUnderline,
} from "react-icons/fi";
import { AiOutlineStrikethrough, AiOutlineOrderedList } from "react-icons/ai";
import { PiHighlighterCircleFill } from "react-icons/pi";
import ATMIconButton from "../../ATMIconButton/ATMIconButton";

type ATMTextEditorMenuBarProps = { editor: any };

const ATMTextEditorMenuBar = ({ editor }: ATMTextEditorMenuBarProps) => {
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    bulletList: false,
    orderedList: false,
    highlight: false,
    textAlignLeft: false,
    textAlignCenter: false,
    textAlignRight: false,
  });

  useEffect(() => {
    if (!editor) return;
    const updateActiveFormats = () => {
      setActiveFormats({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        highlight: editor.isActive("highlight"),
        textAlignLeft: editor.isActive({ textAlign: "left" }),
        textAlignCenter: editor.isActive({ textAlign: "center" }),
        textAlignRight: editor.isActive({ textAlign: "right" }),
      });
    };
    editor.on("transaction", updateActiveFormats);
    updateActiveFormats();
    return () => editor.off("transaction", updateActiveFormats);
  }, [editor]);

  if (!editor) return null;

  
  const options = [
    {
      icon: <FiBold />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: activeFormats.bold,
    },
    {
      icon: <FiItalic />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: activeFormats.italic,
    },
    {
      icon: <FiUnderline />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      pressed: activeFormats.underline,
    },
    {
      icon: <AiOutlineStrikethrough />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: activeFormats.strike,
    },
    {
      icon: <FiAlignLeft />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: activeFormats.textAlignLeft,
    },
    {
      icon: <FiAlignCenter />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: activeFormats.textAlignCenter,
    },
    {
      icon: <FiAlignRight />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: activeFormats.textAlignRight,
    },
    {
      icon: <FiList />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: activeFormats.bulletList,
    },
    {
      icon: <AiOutlineOrderedList />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: activeFormats.orderedList,
    },
    {
      icon: <PiHighlighterCircleFill />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      pressed: activeFormats.highlight,
    },
  ];
  const handleFontSizeChange: React.ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    editor.chain().focus().setFontSize(e.target.value).run();
  };

  return (
    <div className="border rounded-md p-1 mb-1 bg-slate-50 space-x-2 flex flex-wrap items-center">
      <select
        onChange={handleFontSizeChange}
        className="text-sm border rounded px-2 py-1 bg-white mr-2"
        defaultValue=""
      >
        <option value="" disabled>
          Font Size
        </option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="32px">32</option>
      </select>

      {options.map((option, idx) => (
        <ATMIconButton
          key={idx}
          onClick={option.onClick}
          className={`p-1 rounded transition-colors duration-200 ${
            option.pressed ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
        >
          {option.icon}
        </ATMIconButton>
      ))}
    </div>
  );
};

export default ATMTextEditorMenuBar;
