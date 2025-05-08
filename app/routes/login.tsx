import { useState } from "react"
import { auth } from "@/integrations/firebase/client"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiInformationFill,
  RiLock2Line,
  RiMailLine,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { signInWithEmailAndPassword } from "firebase/auth"
import { z } from "zod"

import { setAuthCookie } from "@/lib/auth-cookies"
import { fetcher } from "@/lib/query"
import * as Checkbox from "@/components/ui/checkbox"
import * as Divider from "@/components/ui/divider"
import * as FancyButton from "@/components/ui/fancy-button"
import * as Hint from "@/components/ui/hint"
import * as Input from "@/components/ui/input"
import * as Label from "@/components/ui/label"
import * as LinkButton from "@/components/ui/link-button"
import * as SocialButton from "@/components/ui/social-button"
import { Grid } from "@/components/grid"
import Image from "@/components/image"

function IconGoogle({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.2449 13.8184V18.4657H22.8349C22.5455 19.9602 21.6771 21.2257 20.3747 22.0766L24.3487 25.0985C26.6642 23.004 28 19.9276 28 16.273C28 15.4221 27.9221 14.6039 27.7773 13.8185L16.2449 13.8184Z"
        fill="#4285F4"
      />
      <path
        d="M5.3137 10.6221C4.47886 12.2366 4.00024 14.0584 4.00024 16.0002C4.00024 17.942 4.47886 19.7639 5.3137 21.3784C5.3137 21.3892 9.388 18.2802 9.388 18.2802C9.14311 17.5602 8.99835 16.7966 8.99835 16.0001C8.99835 15.2036 9.14311 14.44 9.388 13.72L5.3137 10.6221Z"
        fill="#FBBC05"
      />
      <path
        d="M16.2448 8.77821C18.0482 8.77821 19.6511 9.3891 20.9313 10.5673L24.4378 7.13097C22.3116 5.18917 19.551 4 16.2448 4C11.4582 4 7.32833 6.69456 5.31348 10.6219L9.38766 13.7201C10.3561 10.8837 13.0611 8.77821 16.2448 8.77821Z"
        fill="#EA4335"
      />
      <path
        d="M9.38238 18.2842L8.48609 18.9566L5.31348 21.3784C7.32833 25.2947 11.4579 28.0002 16.2445 28.0002C19.5506 28.0002 22.3224 26.9311 24.3484 25.0984L20.3744 22.0766C19.2835 22.7966 17.892 23.233 16.2445 23.233C13.0609 23.233 10.3559 21.1275 9.38739 18.2911L9.38238 18.2842Z"
        fill="#34A853"
      />
    </svg>
  )
}

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: z.object({
    tenantId: z.string().optional(),
    redirect: z.string().optional(),
  }),
})

function RouteComponent() {
  const [showPassword, setShowPassword] = useState(false)
  const { tenantId, redirect } = Route.useSearch()
  auth.tenantId = tenantId || (import.meta.env.DEV ? "Tempero-kjm9i" : null)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      auth.tenantId = tenantId ?? "Tempero-kjm9i"
      const go = await signInWithEmailAndPassword(
        auth,
        value.email,
        value.password
      )
      const me = await fetcher({
        key: "people:me",
        // @ts-ignore
        ctx: {
          token: await go.user.getIdToken(true),
          tenantId: auth.tenantId ?? null,
          uid: null,
        },
        input: null,
      })

      const token = await go.user.getIdToken()
      await setAuthCookie({
        data: {
          token,
          uid: me?.uid ?? null,
          tenantId: auth.tenantId ?? null,
          companyUid: me?.company?.uid ?? null,
        },
      })
      navigate({ to: redirect ?? "/" })
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    },
  })

  return (
    <Grid className="relative h-screen w-screen bg-bg-soft-200 p-2">
      <Image
        path="auth.webp"
        width={1920}
        height={1080}
        sizes="100vw"
        lqip={{
          active: true,
          quality: 1,
          blur: 100,
        }}
        className="absolute inset-0 z-0 h-screen w-screen object-cover"
      />
      <div className="relative z-10 col-span-5 flex h-full flex-col items-center justify-center gap-5 rounded-3xl bg-bg-white-0 p-6 shadow-regular-xs *:max-w-screen-sm">
        <header className="flex flex-col items-center gap-5">
          <img
            src="https://alignui.com/images/logo/apex.svg"
            alt=""
            className="size-14"
          />
          <div className="text-center">
            <h1 className="text-title-h6 text-text-strong-950">Welcome back</h1>
            <p className="text-paragraph-sm text-text-sub-600">
              Please enter your details to login.
            </p>
          </div>
        </header>
        <div className="grid w-full grid-cols-3 gap-3">
          <SocialButton.Root brand="google" mode="stroke">
            <SocialButton.Icon as={IconGoogle} />
          </SocialButton.Root>
          <SocialButton.Root brand="google" mode="stroke">
            <SocialButton.Icon as={IconGoogle} />
          </SocialButton.Root>
          <SocialButton.Root brand="google" mode="stroke">
            <SocialButton.Icon as={IconGoogle} />
          </SocialButton.Root>
        </div>
        <div className="w-full">
          <Divider.Root variant="line-text">OR</Divider.Root>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="flex w-full flex-col gap-5"
        >
          <div className="flex w-full flex-col gap-3">
            <form.Field name="email">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor={field.name}>
                    Email Address
                    <Label.Asterisk />
                  </Label.Root>

                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Icon as={RiMailLine} />
                      <Input.Field
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="john.doe@orgdomain.com"
                      />
                    </Input.Wrapper>
                  </Input.Root>

                  <Hint.Root>
                    <Hint.Icon as={RiInformationFill} />
                    Use your organization email if you have one
                  </Hint.Root>
                </div>
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor={field.name}>Password</Label.Root>

                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Icon as={RiLock2Line} />
                      <Input.Field
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {showPassword ? (
                          <RiEyeOffLine className="size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300" />
                        ) : (
                          <RiEyeLine className="size-5 text-text-soft-400 group-has-[disabled]:text-text-disabled-300" />
                        )}
                      </button>
                    </Input.Wrapper>
                  </Input.Root>
                </div>
              )}
            </form.Field>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox.Root id="remember" />
              <Label.Root className="text-paragraph-sm" htmlFor="remember">
                Remember Me
              </Label.Root>
            </div>
            <LinkButton.Root>Forgot?</LinkButton.Root>
          </div>
          <form.Subscribe>
            {(state) => (
              <FancyButton.Root
                disabled={!state.canSubmit || state.isSubmitting}
                type="submit"
                className="w-full"
              >
                Login
              </FancyButton.Root>
            )}
          </form.Subscribe>

          <div className="flex items-baseline justify-center gap-1 text-paragraph-sm text-text-sub-600">
            <span>Don't have an account?</span>
            <LinkButton.Root>Register</LinkButton.Root>
          </div>
        </form>
      </div>
    </Grid>
  )
}
