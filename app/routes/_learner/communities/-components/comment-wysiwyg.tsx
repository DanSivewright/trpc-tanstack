import { useRef, useState } from "react"
import { Highlight } from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import { Typography } from "@tiptap/extension-typography"
import { Underline } from "@tiptap/extension-underline"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"

import { Link } from "@/components/tiptap-extension/link-extension"
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension"

import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

import { RiLoaderLine } from "@remixicon/react"

import { FancyButton } from "@/components/ui/fancy-button"
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"
import {
  HighlightContent,
  HighlighterButton,
  HighlightPopover,
} from "@/components/tiptap-ui/highlight-popover"
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/components/tiptap-ui/link-popover"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { NodeButton } from "@/components/tiptap-ui/node-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

type Props = {
  handleComment: ({
    htmlString,
    parentCommentId,
    rootParentCommentId,
  }: {
    htmlString: string
    parentCommentId: string | null
    rootParentCommentId: string | null
  }) => Promise<void>
  isPending: boolean
  parentCommentId: string | null
  rootParentCommentId: string | null
  placeholder?: string
}
const CommentWysiwyg: React.FC<Props> = ({
  handleComment,
  parentCommentId,
  rootParentCommentId,
  isPending,
  placeholder = "Write something…",
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class:
          "ring-1 shadow-regular-xs ring-inset ring-stroke-soft-200 focus:outline-none min-h-[100px] rounded-xl bg-bg-white-0 p-4",
      },
    },
    extensions: [
      Placeholder.configure({
        placeholder,
      }),
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      TrailingNode,
      Typography,
      Link.configure({ openOnClick: false }),
    ],
  })

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="w-full rounded-[16px] bg-bg-weak-50 p-1 ring-1 ring-stroke-soft-200 drop-shadow-2xl">
        <div className="overflow-hidden rounded-xl ring-1 ring-stroke-soft-200 drop-shadow-xl">
          <EditorContent editor={editor} />

          <div className="-mt-[9px] w-full bg-bg-weak-50 pt-[9px]">
            <div className="flex w-full items-center justify-between gap-4 p-1.5">
              <Toolbar
                style={{
                  background: "none",
                  padding: "0",
                  border: "none",
                  minHeight: "unset",
                }}
                ref={toolbarRef}
              >
                {mobileView === "main" ? (
                  <MainToolbarContent
                    onHighlighterClick={() => setMobileView("highlighter")}
                    onLinkClick={() => setMobileView("link")}
                    isMobile={true}
                  />
                ) : (
                  <MobileToolbarContent
                    type={mobileView === "highlighter" ? "highlighter" : "link"}
                    onBack={() => setMobileView("main")}
                  />
                )}
              </Toolbar>
              <FancyButton.Root
                disabled={isPending}
                onClick={async () => {
                  await handleComment({
                    htmlString: editor?.getHTML() || "",
                    parentCommentId,
                    rootParentCommentId,
                  })
                  editor?.commands?.clearContent()
                }}
                className="rounded-[6px]"
                size="xsmall"
              >
                Reply
                {isPending && (
                  <FancyButton.Icon
                    as={RiLoaderLine}
                    className="animate-spin"
                  />
                )}
              </FancyButton.Root>
            </div>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  )
}
export default CommentWysiwyg

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />
      <ToolbarGroup>
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <NodeButton type="codeBlock" />
        <NodeButton type="blockquote" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <HighlightPopover />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? <HighlightContent /> : <LinkContent />}
  </>
)
