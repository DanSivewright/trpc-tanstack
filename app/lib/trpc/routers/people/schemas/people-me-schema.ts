import { z } from "zod"

export const PeopleMeSchema = z
  .object({
    uid: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isManager: z.boolean().optional().nullable(),
    detail: z
      .object({
        knownAs: z.string().optional().nullable(),
        biography: z.string().optional().nullable(),
        hobbies: z.array(z.string()).optional().nullable(),
        interests: z.array(z.string()).optional().nullable(),
      })
      .optional()
      .nullable(),
    contact: z
      .object({
        email: z.string().email().optional().nullable(),
        tel: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
    preference: z
      .object({
        alertFrequency: z.string().optional().nullable(),
        appearance: z.string().optional().nullable(),
        defaultLanguageId: z.number().optional().nullable(),
      })
      .optional()
      .nullable(),
    badges: z.array(z.unknown()).optional().nullable(),
    languages: z.array(z.unknown()).optional().nullable(),
    companyPerson: z
      .object({
        companyUid: z.string(),
        uid: z.string().uuid(),
        email: z.string().email().optional().nullable(),
        tel: z.string().optional().nullable(),
        branchUid: z.string().optional().nullable(),
        companyCode: z.string().optional().nullable(),
        admin: z
          .object({
            uid: z.string().optional().nullable(),
            roles: z.array(z.string()).optional().nullable(),
          })
          .optional()
          .nullable(),
        company: z
          .object({
            uid: z.string().uuid().optional().nullable(),
            tenantId: z.string().optional().nullable(),
            name: z.string().optional().nullable(),
            imageUrl: z.string().url().optional().nullable(),
            featureImageUrl: z.string().url().optional().nullable(),
          })
          .optional()
          .nullable(),
        employment: z
          .object({
            uid: z.string().uuid().optional().nullable(),
            employeeNumber: z.string().optional().nullable(),
            type: z.string().optional().nullable(),
            jobTitle: z.string().optional().nullable(),
            jobManagerUid: z.string().uuid().optional().nullable(),
          })
          .optional()
          .nullable(),
        talentCompanyPerson: z.unknown().optional().nullable(),
        branch: z.unknown().optional().nullable(),
      })
      .optional()
      .nullable(),
    company: z
      .object({
        uid: z.string(),
        tenantId: z.string(),
        name: z.string(),
        imageUrl: z.string().optional().nullable(),
        configuration: z
          .object({
            products: z
              .object({
                auth: z
                  .object({
                    providers: z
                      .array(z.string().optional().nullable())
                      .optional()
                      .nullable(),
                    allowedDomains: z
                      .array(z.string().optional().nullable())
                      .optional()
                      .nullable(),
                    defaultProvider: z.string().optional().nullable(),
                    featureImageUrl: z.string().url().optional().nullable(),
                    validDomainInput: z
                      .object({
                        name: z.string().optional().nullable(),
                        type: z.string().optional().nullable(),
                        label: z.string().optional().nullable(),
                        options: z
                          .array(
                            z
                              .object({
                                value: z.string().optional().nullable(),
                                description: z.string().optional().nullable(),
                              })
                              .optional()
                              .nullable()
                          )
                          .optional()
                          .nullable(),
                      })
                      .optional()
                      .nullable(),
                    invalidDomainInput: z
                      .object({
                        name: z.string().optional().nullable(),
                        type: z.string().optional().nullable(),
                        label: z.string().optional().nullable(),
                        options: z
                          .array(
                            z
                              .object({
                                value: z.string().optional().nullable(),
                                description: z.string().optional().nullable(),
                              })
                              .optional()
                              .nullable()
                          )
                          .optional()
                          .nullable(),
                      })
                      .optional()
                      .nullable(),
                    selfRegistrationEnabled: z.boolean().optional().nullable(),
                  })
                  .optional()
                  .nullable(),
                learn: z
                  .object({
                    auth: z
                      .object({
                        providers: z
                          .array(z.string().optional().nullable())
                          .optional()
                          .nullable(),
                        allowedDomains: z
                          .array(z.string().optional().nullable())
                          .optional()
                          .nullable(),
                        defaultProvider: z.string().optional().nullable(),
                        featureImageUrl: z.string().url().optional().nullable(),
                        validDomainInput: z
                          .object({
                            name: z.string().optional().nullable(),
                            type: z.string().optional().nullable(),
                            label: z.string().optional().nullable(),
                            options: z
                              .array(
                                z
                                  .object({
                                    value: z.string().optional().nullable(),
                                    description: z
                                      .string()
                                      .optional()
                                      .nullable(),
                                  })
                                  .optional()
                                  .nullable()
                              )
                              .optional()
                              .nullable(),
                          })
                          .optional()
                          .nullable(),
                        invalidDomainInput: z
                          .object({
                            name: z.string().optional().nullable(),
                            type: z.string().optional().nullable(),
                            label: z.string().optional().nullable(),
                            options: z
                              .array(
                                z
                                  .object({
                                    value: z.string().optional().nullable(),
                                    description: z
                                      .string()
                                      .optional()
                                      .nullable(),
                                  })
                                  .optional()
                                  .nullable()
                              )
                              .optional()
                              .nullable(),
                          })
                          .optional()
                          .nullable(),
                        selfRegistrationEnabled: z
                          .boolean()
                          .optional()
                          .nullable(),
                      })
                      .optional()
                      .nullable(),
                    locales: z
                      .array(z.string().optional().nullable())
                      .optional()
                      .nullable(),
                    support: z
                      .array(
                        z
                          .object({
                            url: z.string().url().optional().nullable(),
                            name: z.string().optional().nullable(),
                          })
                          .optional()
                          .nullable()
                      )
                      .optional()
                      .nullable(),
                    certificates: z
                      .object({
                        signatureImageUrl: z
                          .string()
                          .url()
                          .optional()
                          .nullable(),
                        stampSealImageUrl: z
                          .string()
                          .url()
                          .optional()
                          .nullable(),
                      })
                      .optional()
                      .nullable(),
                    defaultFeatureImageUrl: z
                      .string()
                      .url()
                      .optional()
                      .nullable(),
                  })
                  .optional()
                  .nullable(),
              })
              .optional()
              .nullable(),
            primaryColour: z.string().optional().nullable(),
            secondaryColour: z.string().optional().nullable(),
          })
          .optional()
          .nullable(),
      })
      .optional()
      .nullable(),
  })
  .optional()
  .nullable()
