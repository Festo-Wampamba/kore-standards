import { Card, CardContent } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { db } from "@/drizzle/db"
import { JobListingTable } from "@/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { cacheTag } from "next/cache" 
import { JobListingForm } from "@/features/jobListings/components/jobListingForm"
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth"
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings"

type Props = {
  params: Promise<{ jobListingId: string }>
}

export default function EditJobListingPage(props: Props) {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <SuspendedPage {...props} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function SuspendedPage({ params }: Props) {
  const { jobListingId } = await params
  const { orgId } = await getCurrentOrganization()

  if (orgId == null) return notFound()

  const jobListing = await getJobListing(jobListingId, orgId)
  if (jobListing == null) return notFound()

  return <JobListingForm jobListing={jobListing} />
}

async function getJobListing(id: string, orgId: string) {
  "use cache"
  cacheTag(getJobListingIdTag(id))

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  })
}