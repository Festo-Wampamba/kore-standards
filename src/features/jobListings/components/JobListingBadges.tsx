import { Badge } from "@/components/ui/badge";
import { JobListingTable } from "@/drizzle/schema";
import {
  formatExperienceLevel,
  formatJobListingLocation,
  formatJobType,
  formatLocationRequirement,
  formatWage,
} from "@/features/jobListings/lib/formatters";
import { cn } from "@/lib/utils";
import {
  BanknoteIcon,
  BuildingIcon,
  Clock4Icon,
  GraduationCapIcon,
  MapIcon,
} from "lucide-react";
import { ComponentProps } from "react";

export function JobListingBadges({
  jobListing: {
    wage,
    wageInterval,
    district,
    city,
    type,
    experienceLevel,
    locationRequirement,
    isFeatured,
  },
  className,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "wage"
    | "wageInterval"
    | "district"
    | "city"
    | "type"
    | "experienceLevel"
    | "locationRequirement"
    | "isFeatured"
  >;
  className?: string;
}) {
  const badgeProps = {
    variant: "outline",
    className: cn(isFeatured && "border-primary/35", className),
  } satisfies ComponentProps<typeof Badge>;

  return (
    <>
      {!isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            className,
            "border-featured bg-featured/50 text-featured-foreground ",
          )}
        >
          Featured
        </Badge>
      )}
      {wage != null && wageInterval != null && (
        <Badge {...badgeProps}>
          <BanknoteIcon />
          {formatWage(wage, wageInterval)}
        </Badge>
      )}
      {(district != null || city != null) && (
        <Badge {...badgeProps}>
          <MapIcon className="size-10" />
          {formatJobListingLocation({ district, city })}
        </Badge>
      )}
      <Badge {...badgeProps}>
        <BuildingIcon />
        {formatLocationRequirement(locationRequirement)}
      </Badge>
      <Badge {...badgeProps}>
        <Clock4Icon />
        {formatJobType(type)}
      </Badge>
      <Badge {...badgeProps}>
        <GraduationCapIcon />
        {formatExperienceLevel(experienceLevel)}
      </Badge>
    </>
  );
}
