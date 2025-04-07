import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_learner/calendar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_learner/calendar"!</div>
}
