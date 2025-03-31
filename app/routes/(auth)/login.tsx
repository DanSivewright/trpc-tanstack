import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { z } from "zod";

import { auth } from "@/lib/firebase";
import { useTRPC } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
  validateSearch: z.object({
    tenantId: z.string().optional(),
    redirect: z.string().optional(),
  }),
});

function RouteComponent() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { tenantId, redirect } = Route.useSearch();
  auth.tenantId = tenantId ?? "Tempero-kjm9i";
  const navigate = useNavigate();

  const mutation = useMutation(trpc.auth.login.mutationOptions());

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // const userCredential = await signInWithEmailAndPassword(
      //   auth,
      //   value.email,
      //   value.password
      // )
      // Get the token after successful sign in
      // await userCredential.user.getIdToken()

      // const token = await mutation.mutateAsync({
      //   email: value.email,
      //   password: value.password,
      //   tenantId: tenantId,
      //   returnUrl: redirect,
      // });

      auth.tenantId = tenantId ?? "Tempero-kjm9i";
      const go = await signInWithEmailAndPassword(
        auth,
        value.email,
        value.password,
      );

      const token = await go.user.getIdToken();
      window.localStorage.setItem("token", token);
      window.localStorage.setItem(
        "tokenExpiration",
        String(Date.now() + 3500 * 1000),
      );
      window.localStorage.setItem("tenantId", auth.tenantId ?? "");
      navigate({ to: redirect ?? "/" });
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    },
  });

  return (
    <div className="mx-auto mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Submitting..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          className="text-indigo-600 hover:text-indigo-800"
        >
          Need an account? Sign Up
        </Button>
      </div>
      {/* <pre>{JSON.stringify(auth.currentUser, null, 2)}</pre> */}
    </div>
  );
}
