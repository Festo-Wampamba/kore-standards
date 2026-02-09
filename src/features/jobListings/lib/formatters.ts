import { LocationRequirement, WageInterval } from "@/drizzle/schema";

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

export function formatLocationRequirement(interval: LocationRequirement) {
    switch (interval) {
        case "in-office":
            return "In Office";
        case "hybrid":
            return "Hybrid";
        case "remote":
            return "Remote";
        default:
            throw new Error(`Unknown location requirement: ${interval satisfies never}`);
    }
}

export function formatJobType(type: string) {
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
            throw new Error(`Unknown job type: ${type}`);
    }
}

export function formatExperienceLevel(level: string) {
    switch (level) {
        case "junior":
            return "Junior";
        case "mid-level":
            return "Mid Level";
        case "senior":
            return "Senior";
        default:
            throw new Error(`Unknown experience level: ${level}`);
    }
}