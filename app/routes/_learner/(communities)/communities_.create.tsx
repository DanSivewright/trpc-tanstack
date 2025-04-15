import { useState } from "react"
import { communitySchema } from "@/integrations/trpc/routers/communities/schemas/communities-schema"
import {
  RiGlobalLine,
  RiInformationFill,
  RiUploadCloud2Line,
} from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute } from "@tanstack/react-router"
import { Timestamp } from "firebase/firestore"
import { z } from "zod"

import * as FileUpload from "@/components/ui/file-upload"
import * as Hint from "@/components/ui/hint"
import * as Input from "@/components/ui/input"
import * as Label from "@/components/ui/label"
import * as Textarea from "@/components/ui/textarea"
import { Section } from "@/components/section"

export const Route = createFileRoute(
  "/_learner/(communities)/communities_/create"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const [files, setFiles] = useState<File[]>([])
  const schema = communitySchema
    .omit({ id: true, createdAt: true, meta: true })
    .extend({
      headline: z.string().min(120).max(200),
    })
  const form = useForm({
    defaultValues: {
      createdAt: Timestamp.now(),
      name: "",
      headline: "",
      logoUrl: "",
      featureImageUrl: "",
      membersCount: 0,
      threadsCount: 0,
      coursesCount: 0,
      articlesCount: 0,
      tags: [],

      membership: {
        role: "admin",
        joinedAt: Timestamp.now(),
      },
    } as z.infer<typeof schema>,
    validators: {
      onSubmit: schema,
    },
  })
  return (
    <div className="h-screen w-screen justify-center">
      <Section className="mx-auto flex w-full max-w-screen-md flex-col">
        <h1 className="text-title-h1 font-normal">Create Community</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-8"
        >
          <form.Field
            name="name"
            children={(field) => {
              return (
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor="email">
                    Name
                    <Label.Asterisk />
                  </Label.Root>

                  <Input.Root>
                    <Input.Wrapper>
                      <Input.Icon as={RiGlobalLine} />
                      <Input.Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Community"
                      />
                    </Input.Wrapper>
                  </Input.Root>

                  <Hint.Root>
                    <Hint.Icon as={RiInformationFill} />
                    This is the name of the community. Pick a good one!
                  </Hint.Root>
                </div>
              )
            }}
          />
          <form.Field
            name="headline"
            children={(field) => {
              return (
                <div className="flex flex-col gap-1">
                  <Label.Root htmlFor="email">
                    Community Headline
                    <Label.Asterisk />
                  </Label.Root>

                  <Textarea.Root
                    placeholder="Community Headline"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id={field.name}
                    name={field.name}
                  >
                    <Textarea.CharCounter
                      current={field.state.value.length}
                      max={200}
                    />
                  </Textarea.Root>

                  <Hint.Root>
                    <Hint.Icon as={RiInformationFill} />
                    Tell us what the community is about in 1 - 2 sentences.
                  </Hint.Root>
                </div>
              )
            }}
          />
          <FileUpload.Root
            files={files}
            setFiles={setFiles}
            fileTypes={["images"]}
            maxFiles={3}
          >
            <input multiple type="file" tabIndex={-1} className="hidden" />
            <FileUpload.Icon as={RiUploadCloud2Line} />

            <div className="space-y-1.5">
              <div className="text-label-sm text-text-strong-950">
                Choose a file or drag & drop it here.
              </div>
              <div className="text-paragraph-xs text-text-sub-600">
                JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
              </div>
            </div>
            <FileUpload.Button>Browse File</FileUpload.Button>
          </FileUpload.Root>
        </form>
      </Section>
    </div>
  )
}
