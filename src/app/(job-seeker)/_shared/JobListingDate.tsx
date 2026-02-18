// src/app/(job-seeker)/_shared/JobListingDate.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { differenceInDays } from "date-fns"
import { useEffect, useState } from "react"

export function JobListingDate({ postedAt }: { postedAt: Date }) {
  const [daysSincePosted, setDaysSincePosted] = useState<number | null>(null)

  useEffect(() => {
    // This runs safely in the browser, avoiding React Compiler errors
    setDaysSincePosted(differenceInDays(postedAt, Date.now()))
  }, [postedAt])

  // Show a blank space or loading skeleton while calculating
  if (daysSincePosted === null) {
    return <span className="opacity-0">Loading...</span>
  }

  if (daysSincePosted === 0) {
    return <Badge>New</Badge>
  }

  return (
    <span>
      {new Intl.RelativeTimeFormat(undefined, {
        style: "narrow",
        numeric: "always",
      }).format(daysSincePosted, "days")}
    </span>
  )
}