import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import z from "zod";

export const jobListingSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    experienceLevel: z.enum(experienceLevels),
    locationRequirement: z.enum(locationRequirements),
    type: z.enum(jobListingTypes),
    wage: z.coerce.number().int().positive().min(1).nullable().optional(),
    wageInterval: z.enum(wageIntervals).nullable(),
    district: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable()
      .optional(),

    city: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // We Use superRefine for custom logic
    // If it is NOT remote, we need a location
    if (data.locationRequirement !== "remote") {
      const hasLocation = data.district != null || data.city != null;

      if (!hasLocation) {
        // Then Attach the error specifically to the "district" field
        // because that is the primary required location field.
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "District is required for on-site/hybrid jobs",
          path: ["district"],
        });
      }
    }
  });
