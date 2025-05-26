import { z } from "zod"

export const EnrolmentResourcesSchema = z.object({
  files: z.array(
    z.object({
      uid: z.string(),
      type: z.string(),
      typeUid: z.string(),
      mediaUid: z.string(),
      learnerVisible: z.boolean(),
      createdByUid: z.string(),
      lastUpdatedByUid: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      deletedAt: z.string().nullable(),
      media: z.object({
        uid: z.string(),
        url: z.string(),
        title: z.string(),
        description: z.string().optional().nullable(),
        type: z.string(),
        isPublic: z.boolean(),
        createdByUid: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        deletedAt: z.string().nullable(),
        companyUid: z.string().optional().nullable(),
      }),
    })
  ),
  folders: z.array(z.any()),
})
export type EnrolmentResourcesType = z.infer<typeof EnrolmentResourcesSchema>
