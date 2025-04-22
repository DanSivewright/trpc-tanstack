import { z } from "zod"

const AdminSchema = z.object({
  uid: z.string().nullable(),
  roles: z.array(z.string()).nullable(),
})

const CompanyBasicSchema = z.object({
  uid: z.string().nullable(),
  tenantId: z.string().nullable(),
  name: z.string().nullable(),
  imageUrl: z.string().nullable(),
  featureImageUrl: z.string().nullable(),
})

const EmploymentSchema = z.object({
  uid: z.string().nullable(),
  employeeNumber: z.string().nullable(),
  type: z.string().nullable(),
  jobTitle: z.string().nullable(),
  jobManagerUid: z.string().nullable(),
})

const CompanyPersonSchema = z.object({
  companyUid: z.string().nullable(),
  uid: z.string().nullable(),
  email: z.string().nullable(),
  tel: z.string().nullable(),
  branchUid: z.string().nullable(),
  companyCode: z.string().nullable(),
  admin: AdminSchema.nullable(),
  company: CompanyBasicSchema.nullable(),
  employment: EmploymentSchema.nullable(),
  talentCompanyPerson: z.unknown().nullable(),
  branch: z.unknown().nullable(),
})

const ContactSchema = z.object({
  email: z.string().nullable(),
  tel: z.string().nullable(),
  iosToken: z.string().nullable(),
  androidToken: z.string().nullable(),
  webToken: z.string().nullable(),
})

const PreferenceSchema = z.object({
  personUid: z.string().nullable(),
  alertFrequency: z.string().nullable(),
  appearance: z.string().nullable(),
  defaultLanguageId: z.number().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  deletedAt: z.string().nullable(),
})

const ProductsConfigSchema = z.object({
  auth: z
    .object({
      providers: z.array(z.string()).nullable(),
      allowedDomains: z.array(z.string()).nullable(),
      defaultProvider: z.string().nullable(),
      featureImageUrl: z.string().nullable(),
      validDomainInput: z
        .object({
          name: z.string().nullable(),
          type: z.string().nullable(),
          label: z.string().nullable(),
          options: z
            .array(
              z.object({
                value: z.string().nullable(),
                description: z.string().nullable(),
              })
            )
            .nullable(),
        })
        .nullable(),
      invalidDomainInput: z
        .object({
          name: z.string().nullable(),
          type: z.string().nullable(),
          label: z.string().nullable(),
          options: z
            .array(
              z.object({
                value: z.string().nullable(),
                description: z.string().nullable(),
              })
            )
            .nullable(),
        })
        .nullable(),
      selfRegistrationEnabled: z.boolean().nullable(),
    })
    .nullable(),
  learn: z
    .object({
      locales: z.array(z.string()).nullable(),
      support: z
        .array(
          z.object({
            url: z.string().nullable(),
            name: z.string().nullable(),
          })
        )
        .nullable(),
      certificates: z
        .object({
          signatureImageUrl: z.string().nullable(),
          stampSealImageUrl: z.string().nullable(),
        })
        .nullable(),
      defaultFeatureImageUrl: z.string().nullable(),
    })
    .nullable(),
})

const CompanySchema = z.object({
  tenantId: z.string().nullable(),
  name: z.string().nullable(),
  uid: z.string().nullable(),
  imageUrl: z.string().nullable(),
  configuration: z
    .object({
      products: ProductsConfigSchema.nullable(),
      primaryColour: z.string().nullable(),
      secondaryColour: z.string().nullable(),
    })
    .nullable(),
})

const UserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().nullable(),
  featureImageUrl: z.string().nullable(),
  accessToken: z.string(),
  contact: ContactSchema,
  preference: PreferenceSchema,
  refreshToken: z.string(),
  expiresAt: z.string(),
  companyPerson: CompanyPersonSchema.nullable(),
  isManager: z.boolean().nullable(),
  company: CompanySchema.nullable(),
})

const TeamSchema = z.object({
  uid: z.string(),
  name: z.string(),
})

const PersonSchema = z.object({
  uid: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().nullable(),
  contact: z.object({
    email: z.string(),
    tel: z.string(),
  }),
})

const JobManagerSchema = z.object({
  companyPersonUid: z.string(),
  companyPerson: z.object({
    uid: z.string(),
    person: z.object({
      uid: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      imageUrl: z.string().nullable(),
    }),
  }),
})

const EmploymentDetailsSchema = z.object({
  uid: z.string(),
  companyPersonUid: z.string(),
  employeeNumber: z.string(),
  type: z.string().nullable(),
  countryCode: z.string().nullable(),
  location: z.string().nullable(),
  startDate: z.string().nullable(),
  jobTitle: z.string().nullable(),
  jobManagerUid: z.string().nullable(),
  externalJobId: z.string().nullable(),
  createdByUid: z.string(),
  lastUpdatedByUid: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  jobManager: JobManagerSchema.nullable(),
})

const PeopleAllSchema = z.object({
  totalPeople: z.number(),
  nextOffset: z.number(),
  people: z.array(
    z.object({
      uid: z.string(),
      companyUid: z.string(),
      personUid: z.string(),
      email: z.string(),
      tel: z.string(),
      race: z.string(),
      sex: z.string(),
      hasDisability: z.boolean(),
      identificationNumber: z.string(),
      nationality: z.string().nullable(),
      dateOfBirth: z.string().nullable(),
      joiningDate: z.string().nullable(),
      attributes: z.object({
        companyCode: z.string(),
      }),
      externalUserId: z.string().nullable(),
      createdByUid: z.string(),
      lastUpdatedByUid: z.string().nullable(),
      branchUid: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      deletedAt: z.string().nullable(),
      groups: z.array(z.unknown()),
      teams: z.array(TeamSchema),
      person: PersonSchema,
      admin: AdminSchema,
      employment: EmploymentDetailsSchema,
    })
  ),
})

export { PeopleAllSchema }
// export type PeopleAllType = z.infer<typeof PeopleAllSchema>
// export type User = z.infer<typeof UserSchema>
// export type Team = z.infer<typeof TeamSchema>
// export type Person = z.infer<typeof PersonSchema>

// export {
//   AdminSchema,
//   CompanyBasicSchema,
//   EmploymentSchema,
//   CompanyPersonSchema,
//   ContactSchema,
//   PreferenceSchema,
//   CompanySchema,
//   UserSchema,
//   TeamSchema,
//   PersonSchema,
//   JobManagerSchema,
//   EmploymentDetailsSchema,
//   PeopleAllSchema,
// }
