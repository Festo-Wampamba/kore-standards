import { JobListingItems } from "./_shared/JobListingItems"

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  return (
    <div className="m-4">
      <JobListingItems searchParams={searchParams} />
    </div>
  )
}
