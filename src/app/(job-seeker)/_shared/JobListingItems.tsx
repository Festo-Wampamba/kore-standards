// src/app/(job-seeker)/_shared/JobListingItems.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  OrganizationTable,
} from "@/drizzle/schema";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { cn } from "@/lib/utils";
// Ensure you import 'ilike' and 'inArray' for the search queries
import { and, desc, eq, or, ilike, inArray, SQL } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { JobListingDate } from "./JobListingDate";
import { JobListingBadges } from "@/features/jobListings/components/JobListingBadges";
import z from "zod";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobListingsGlobalTag } from "@/features/jobListings/db/cache/jobListings";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organization";

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
  params?: Promise<{ jobListingId: string }>;
};

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  district: z.string().optional().catch(undefined), // Replaced state with district
  experience: z.enum(experienceLevels).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  // Transform guarantees this always becomes an array, even if it's a single string in the URL
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (Array.isArray(val) ? val : val ? [val] : undefined))
    .catch(undefined),
});

export function JobListingItems(props: Props) {
  return (
    <Suspense>
      <SuspendedComponent {...props} />
    </Suspense>
  );
}

async function SuspendedComponent({ searchParams, params }: Props) {
  const jobListingId = params ? (await params).jobListingId : undefined;
  const search = await searchParams;

  // 1. Validate and parse the URL parameters safely with Zod
  const parsedParams = searchParamsSchema.parse(search);

  // 2. Pass the strongly-typed parsed parameters to the database function
  const jobListings = await getJobListings(parsedParams, jobListingId);

  if (jobListings.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No job listings found</div>
    );
  }

  return (
    <div className="space-y-4">
      {jobListings.map((jobListing) => (
        <Link
          className="block"
          key={jobListing.id}
          href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(search)}`}
        >
          <JobListingListItem
            jobListing={jobListing}
            organization={jobListing.organization}
          />
        </Link>
      ))}
    </div>
  );
}

function JobListingListItem({
  jobListing,
  organization,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "title"
    | "district"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "postedAt"
    | "locationRequirement"
    | "isFeatured"
  >;
  organization: Pick<
    typeof OrganizationTable.$inferSelect,
    "name" | "imageUrl"
  >;
}) {
  const nameInitials = organization?.name
    .split(" ")
    .splice(0, 4)
    .map((word) => word[0])
    .join("");

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border-featured bg-featured/20",
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              src={organization.imageUrl ?? undefined}
              alt={organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{jobListing.title}</CardTitle>
            <CardDescription className="text-base">
              {organization.name}
            </CardDescription>
            {jobListing.postedAt != null && (
              <div className="text-sm font-medium text-primary @min-md:hidden">
                <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                  <JobListingDate postedAt={jobListing.postedAt} />
                </Suspense>
              </div>
            )}
          </div>
          {jobListing.postedAt != null && (
            <div className="text-sm font-medium text-primary ml-auto @max-md:hidden">
              <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                <JobListingDate postedAt={jobListing.postedAt} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary/35" : undefined}
        />
      </CardContent>
    </Card>
  );
}

// 3. Update the function signature to use the inferred Zod type
async function getJobListings(
  parsedParams: z.infer<typeof searchParamsSchema>,
  jobListingId: string | undefined,
) {
 "use cache"
  cacheTag(getJobListingsGlobalTag())
  const whereConditions: (SQL | undefined)[] = [];

  // 4. Dynamically push conditions into the array if the param exists
  if (parsedParams.title) {
    whereConditions.push(
      ilike(JobListingTable.title, `%${parsedParams.title}%`),
    );
  }
  if (parsedParams.city) {
    whereConditions.push(ilike(JobListingTable.city, `%${parsedParams.city}%`));
  }
  if (parsedParams.district) {
    whereConditions.push(
      ilike(JobListingTable.district, `%${parsedParams.district}%`),
    );
  }
  if (parsedParams.experience) {
    whereConditions.push(
      eq(JobListingTable.experienceLevel, parsedParams.experience),
    );
  }
  if (parsedParams.locationRequirement) {
    // This perfectly handles your remote logic!
    whereConditions.push(
      eq(JobListingTable.locationRequirement, parsedParams.locationRequirement),
    );
  }
  if (parsedParams.type) {
    whereConditions.push(eq(JobListingTable.type, parsedParams.type));
  }
  if (parsedParams.jobIds && parsedParams.jobIds.length > 0) {
    whereConditions.push(inArray(JobListingTable.id, parsedParams.jobIds));
  }

  const data = await db.query.JobListingTable.findMany({
    where: or(
      jobListingId
        ? and(
            eq(JobListingTable.status, "published"),
            eq(JobListingTable.id, jobListingId),
          )
        : undefined,
      // Drizzle handles an array of conditions perfectly here
      and(eq(JobListingTable.status, "published"), ...whereConditions),
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)],
  });

  data.forEach(listing => {
    cacheTag(getOrganizationIdTag(listing.organization.id))
  })
  return data
}
