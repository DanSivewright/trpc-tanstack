import { db } from "@/integrations/firebase/server"
import { trpcQuerySchema } from "@/integrations/trpc/schema"
import { tryCatch } from "@/utils/try-catch"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { generateCacheKey, useStorage } from "@/lib/cache"
import { fetcher } from "@/lib/query"

import { createCommunityFeedItem } from "../feed/mutations"
import {
  communityCourseSchema,
  communityEnrolmentsSchema,
} from "../schemas/communities-schema"

export const createCommunityCourseSchema = z.array(
  communityCourseSchema
    .pick({
      id: true,
      authorUid: true,
      author: true,
      communityId: true,
      typeUid: true,
      type: true,
      typeAccessor: true,
      publicationUid: true,
    })
    .merge(
      communityCourseSchema
        .omit({
          publicationUid: true,
          id: true,
          authorUid: true,
          author: true,
          communityId: true,
          typeUid: true,
          type: true,
          typeAccessor: true,
        })
        .partial()
    )
)

const createCommunityCourseOptions = trpcQuerySchema
  .pick({
    ctx: true,
  })
  .extend({
    input: createCommunityCourseSchema,
  })
export const createCommunityCourse = async (
  opts: z.infer<typeof createCommunityCourseOptions>
) => {
  const { input, ctx } = opts
  const batch = db.batch()

  const enrolmentsMap = new Map<string, Set<string>>()
  const communityIds = new Set<string>()
  for (const course of input) {
    const { enrolments, ...courseData } = course
    communityIds.add(course.communityId)
    const courseRef = db
      .collection("communities")
      .doc(course.communityId)
      .collection("courses")
      .doc(course.id)

    batch.set(courseRef, {
      ...courseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Create enrolments collection group if enrolments exist
    if (enrolments && enrolments.length > 0) {
      enrolmentsMap.set(
        course.publicationUid,
        enrolmentsMap.get(course.publicationUid)
          ? new Set([
              ...(enrolmentsMap.get(course.publicationUid) ?? []),
              ...enrolments?.map((e) => e.enrolleeUid),
            ])
          : new Set(enrolments?.map((e) => e.enrolleeUid))
      )
      for (const enrolment of enrolments) {
        const enrolmentRef = db
          .collection("communities")
          .doc(course.communityId)
          .collection("enrolments")
          .doc(enrolment.id)

        batch.set(enrolmentRef, {
          ...enrolment,
          communityId: course.communityId,
          courseDocId: course.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }
  }

  await batch.commit()
  await Promise.all([
    ...Array.from(enrolmentsMap.entries()).map(
      ([publicationUid, enrolleeUids]) => {
        return tryCatch(
          fetcher({
            key: "enrol:people",
            ctx,
            input: {
              params: {
                publicationUid,
              },
              body: {
                personUids: Array.from(enrolleeUids),
              },
              query: {
                companyUid: ctx.companyUid ?? "",
              },
            },
          })
        )
      }
    ),
    ...input?.map((course) => {
      return createCommunityFeedItem({
        communityId: course?.communityId,
        authorUid: course?.authorUid,
        author: course?.author,
        type: "course",
        group: "courses",
        groupDocId: course?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        descriptor: "",
        source: "user",
        verb: "created",
        input: {
          communityId: course?.communityId,
          courseId: course?.id,
        },
        isFeatured: false,
        isFeaturedUntil: null,
        isFeaturedFrom: null,
      })
    }),
  ])
  const storage = useStorage()
  const keys = await storage.keys()
  const coursesKeys = Array.from(communityIds).map((cid) => {
    return generateCacheKey({
      type: "query",
      path: "communities.courses.all",
      input: { communityId: cid },
    })
  })

  const deleteKeys = [
    ...coursesKeys,
    ...input?.map((course) => {
      return generateCacheKey({
        type: "query",
        path: "communities.feed.all",
        input: {
          //
          communityId: course?.communityId,
        },
      })
    }),
  ]

  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )
}

export const deleteCommunityCourseSchema = z.object({
  communityId: z.string(),
  courseId: z.string(),
})

export const deleteCommunityCourse = async (
  input: z.infer<typeof deleteCommunityCourseSchema>
) => {
  const { communityId, courseId } = input
  const enrolmentsSnap = await db
    .collectionGroup("enrolments")
    .where("communityId", "==", communityId)
    .where("courseDocId", "==", courseId)
    .get()

  const batch = db.batch()
  enrolmentsSnap.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })

  const courseRef = db
    .collection("communities")
    .doc(communityId)
    .collection("courses")
    .doc(courseId)
  batch.delete(courseRef)

  await tryCatch(batch.commit())

  const storage = useStorage()
  const keys = await storage.keys()

  const deleteKeys = [
    generateCacheKey({
      type: "query",
      path: "communities.courses.detail",
      input: {
        courseId: input.courseId,
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.courses.all",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.courses.enrolments",
      input: {
        courseDocId: input.courseId,
        communityId: input.communityId,
      },
    }),
  ]

  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )

  return { success: true }
}

export const updateCommunityCourseSchema = communityCourseSchema
  .pick({
    status: true,
    accessibile: true,
    title: true,
    tags: true,
    caption: true,
    isFeatured: true,
    isFeaturedUntil: true,
    isFeaturedFrom: true,
  })
  .partial()
  .extend({
    id: z.string(),
    communityId: z.string(),
  })

export const updateCommunityCourse = async (
  input: z.infer<typeof updateCommunityCourseSchema>
) => {
  const { id, ...payload } = input

  const snap = await db
    .collection("communities")
    .doc(input.communityId)
    .collection("courses")
    .doc(input.id)
    .get()

  if (!snap.exists) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Course not found",
    })
  }

  const docRef = snap.ref
  await docRef.update(payload)
  const storage = useStorage()
  const keys = await storage.keys()

  const courseDetailKey = generateCacheKey({
    type: "query",
    path: "communities.courses.detail",
    input: {
      courseId: input.id,
      communityId: input.communityId,
    },
  })

  const coursesKey = generateCacheKey({
    type: "query",
    path: "communities.courses.all",
    input: {
      communityId: input.communityId,
    },
  })

  await Promise.all([
    storage.remove(keys.find((key) => key.includes(courseDetailKey)) as string),
    storage.remove(keys.find((key) => key.includes(coursesKey)) as string),
  ])

  return { success: true }
}

export const enrolToCommunityCourseSchema = communityEnrolmentsSchema
  .pick({
    courseDocId: true,
    enrolleeUid: true,
    enrollee: true,
    publicationUid: true,
  })
  .extend({
    communityId: z.string(),
  })

const enrolToCommunityCourseOptions = trpcQuerySchema
  .pick({
    ctx: true,
  })
  .extend({
    input: enrolToCommunityCourseSchema,
  })

export const enrolToCommunityCourse = async (
  opts: z.infer<typeof enrolToCommunityCourseOptions>
) => {
  const { input, ctx } = opts
  const payload = {
    ...input,
    id: crypto.randomUUID(),
    enrolmentUid: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorUid: ctx.uid,
  }

  const enrolFb = await tryCatch(
    db
      .collection("communities")
      .doc(input.communityId)
      .collection("enrolments")
      .doc(payload.id)
      .set(payload)
  )
  if (enrolFb.error || !enrolFb.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to enrol to course",
    })
  }
  const enrolDb = await tryCatch(
    fetcher({
      key: "enrol:people",
      ctx,
      input: {
        params: {
          publicationUid: input.publicationUid,
        },
        body: {
          personUids: [input.enrolleeUid],
        },
        query: {
          companyUid: ctx.companyUid ?? "",
        },
      },
    })
  )
  if (enrolDb.error || !enrolDb.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to enrol to course on API",
    })
  }

  const storage = useStorage()
  const keys = await storage.keys()

  const deleteKeys = [
    generateCacheKey({
      type: "query",
      path: "communities.courses.detail",
      input: {
        courseId: input.courseDocId,
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.courses.all",
      input: {
        communityId: input.communityId,
      },
    }),
    generateCacheKey({
      type: "query",
      path: "communities.courses.enrolments",
      input: {
        courseDocId: input.courseDocId,
        communityId: input.communityId,
      },
    }),
  ]

  await Promise.all(
    deleteKeys.map((key) =>
      storage.remove(keys.find((k) => k.includes(key)) as string)
    )
  )
  return { success: true }
}
