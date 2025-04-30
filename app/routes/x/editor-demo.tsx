import { createFileRoute } from "@tanstack/react-router"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"

export const Route = createFileRoute("/x/editor-demo")({
  component: RouteComponent,
})

function RouteComponent() {
  return <SimpleEditor />
}
