import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { signOut } from "firebase/auth";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const e = useQuery(trpc.enrolments.all.queryOptions());

  return (
    <div>
      <h1>Home</h1>
      <Button onClick={() => signOut(auth)}>Sign Out</Button>
      <pre>{JSON.stringify({ e }, null, 2)}</pre>
    </div>
  );
}
