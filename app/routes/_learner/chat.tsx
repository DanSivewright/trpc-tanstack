import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_learner/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/chat"!</div>
}
