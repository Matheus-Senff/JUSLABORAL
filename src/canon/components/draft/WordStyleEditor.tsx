import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension, Mark, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { AlignCenter, AlignLeft, AlignRight, Bold, ChevronLeft, ChevronRight, Italic, List, ListOrdered, Redo2, Underline as UnderlineIcon, Undo2 } from "lucide-react";
import { Button } from "@canon/components/ui/button";
import { cn } from "@canon/lib/utils";

const ParagraphFormat = Extension.create({
  name: "paragraphFormat",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {};
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
          marginLeft: {
            default: null,
            parseHTML: (element) => element.style.marginLeft || null,
            renderHTML: (attributes) => {
              if (!attributes.marginLeft) return {};
              return { style: `margin-left: ${attributes.marginLeft}` };
            },
          },
        },
      },
    ];
  },
});

const UnresolvedPlaceholderHighlight = Mark.create({
  name: "unresolvedPlaceholderHighlight",
  inclusive: false,
  parseHTML() {
    return [{ tag: "span[data-unresolved-placeholder]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-unresolved-placeholder": "true",
        style: "color: hsl(var(--unresolved-placeholder)); font-weight: 600; border-radius: 0.25rem; padding: 0 0.2rem;",
      }),
      0,
    ];
  },
});

const fontOptions = [
  { label: "Arial Narrow", value: "'Arial Narrow', Arial, Helvetica, sans-serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
];

const spacingOptions = [
  { label: "1.3", value: "1.3" },
  { label: "1.5", value: "1.5" },
  { label: "2.0", value: "2" },
];

const indentLevels = ["0rem", "1.5rem", "3rem"];

interface WordStyleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function WordStyleEditor({ value, onChange, placeholder }: WordStyleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, blockquote: false, code: false, codeBlock: false, horizontalRule: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      ParagraphFormat,
      UnresolvedPlaceholderHighlight,
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[920px] w-full max-w-none focus:outline-none text-[12pt] leading-8 text-paper-foreground [&_p]:mb-4 [&_p]:text-left [&_ol]:mb-4 [&_ol]:pl-6 [&_ul]:mb-4 [&_ul]:pl-6 [&_li]:mb-2",
        style: "font-family: 'Arial Narrow', Arial, Helvetica, sans-serif; font-size: 12pt;",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [editor, value]);

  const hasText = editor?.getText().trim().length;
  const paragraphAttributes = editor?.getAttributes("paragraph") ?? {};
  const currentIndent = typeof paragraphAttributes.marginLeft === "string" ? paragraphAttributes.marginLeft : "0rem";
  const currentIndentIndex = Math.max(indentLevels.indexOf(currentIndent), 0);
  const fontFamilyValue = typeof paragraphAttributes.fontFamily === "string" ? paragraphAttributes.fontFamily : fontOptions[0].value;
  const lineHeightValue = typeof paragraphAttributes.lineHeight === "string" ? paragraphAttributes.lineHeight : spacingOptions[0].value;

  const updateParagraphAttributes = (attributes: Record<string, string | null>) => {
    editor?.chain().focus().updateAttributes("paragraph", attributes).run();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-2 py-2 md:px-3 md:py-3">
      <div className="flex h-[10%] min-h-[72px] shrink-0 items-center border-b border-border/60 pb-2">
        <div className="w-full overflow-x-auto">
          <div className="flex min-w-max items-center gap-1.5 rounded-xl border border-border/60 bg-card/95 px-2 py-2 shadow-lg backdrop-blur">
          <select
            value={fontFamilyValue}
            onChange={(event) => updateParagraphAttributes({ fontFamily: event.target.value })}
            className="h-8 rounded-lg border border-input bg-background px-2 text-[11px] text-foreground focus:outline-none"
          >
            {fontOptions.map((option) => (
              <option key={option.label} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={lineHeightValue}
            onChange={(event) => updateParagraphAttributes({ lineHeight: event.target.value })}
            className="h-8 rounded-lg border border-input bg-background px-2 text-[11px] text-foreground focus:outline-none"
          >
            {spacingOptions.map((option) => (
              <option key={option.label} value={option.value}>Esp. {option.label}</option>
            ))}
          </select>

          <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={() => updateParagraphAttributes({ marginLeft: indentLevels[Math.max(currentIndentIndex - 1, 0)] })}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={() => updateParagraphAttributes({ marginLeft: indentLevels[Math.min(currentIndentIndex + 1, indentLevels.length - 1)] })}><ChevronRight className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive("bold") ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive("italic") ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive("underline") ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive({ textAlign: "left" }) ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive({ textAlign: "center" }) ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive({ textAlign: "right" }) ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().setTextAlign("right").run()}><AlignRight className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive("bulletList") ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant={editor?.isActive("orderedList") ? "default" : "outline"} className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().undo().run()}><Undo2 className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => editor?.chain().focus().redo().run()}><Redo2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden pt-2">
        <div className="h-full w-full overflow-auto px-1 py-1 md:px-2">
          <div className="mx-auto w-full max-w-[920px] bg-paper">
            <div className="relative min-h-[calc(100vh-12rem)] px-6 py-8 md:px-[68px] md:py-[72px]">
              {!hasText && <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-10 text-center"><p className="text-xl text-paper-foreground/45" style={{ fontFamily: "'Arial Narrow', Arial, sans-serif" }}>{placeholder}</p></div>}
              <EditorContent editor={editor} className={cn(!hasText && "relative z-10")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
