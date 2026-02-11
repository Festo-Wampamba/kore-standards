import {
  ExperienceLevel,
  JobListingStatus,
  JobListingType,
  LocationRequirement,
  WageInterval,
} from "@/drizzle/schema";

export function formatWageInterval(interval: WageInterval) {
  switch (interval) {
    case "daily":
      return "Daily";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    default:
      throw new Error(`Unknown wage interval: ${interval satisfies never}`);
  }
}

export function formatLocationRequirement(
  locationRequirement: LocationRequirement,
) {
  switch (locationRequirement) {
    case "in-office":
      return "In Office";
    case "hybrid":
      return "Hybrid";
    case "remote":
      return "Remote";
    default:
      throw new Error(
        `Unknown location requirement: ${locationRequirement satisfies never}`,
      );
  }
}

export function formatJobType(type: JobListingType) {
  switch (type) {
    case "full-time":
      return "Full Time";
    case "part-time":
      return "Part Time";
    case "contract":
      return "Contract";
    case "internship":
      return "Internship";
    default:
      throw new Error(`Unknown job type: ${type satisfies never}`);
  }
}

export function formatExperienceLevel(experienceLevel: ExperienceLevel) {
  switch (experienceLevel) {
    case "junior":
      return "Junior";
    case "mid-level":
      return "Mid Level";
    case "senior":
      return "Senior";
    default:
      throw new Error(
        `Unknown experience level: ${experienceLevel satisfies never}`,
      );
  }
}

export function formatJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "published":
      return "Active";
    case "delisted":
      return "Delisted";
    default:
      throw new Error(`Unknown job listing status: ${status satisfies never}`);
  }
}

export function formatWage(wage: number, wageInterval: string) {
  const wageFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  switch (wageInterval) {
    case "daily":
      return `${wageFormatter.format(wage)} / day`;
    case "monthly":
      return `${wageFormatter.format(wage)} / mo`;
    case "yearly":
      return `${wageFormatter.format(wage)} / yr`;
    default:
      return wageFormatter.format(wage);
  }
}


export function formatJobListingLocation({
  district,
  city,
}: {
  district: string | null;
  city: string | null;
}) {
  if (district == null && city == null) return "Location not specified";

  const locationParts: string[] = [];

  if (city != null) locationParts.push(city);

  if (district != null) {
    locationParts.push(district);
  }

  return locationParts.join(", ");
}
