"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExperienceLevel,
  experienceLevels,
  JobListingType,
  jobListingTypes,
  LocationRequirement,
  locationRequirements,
} from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
} from "../lib/formatters";
import { UGANDA_DISTRICTS } from "@/lib/constants/location";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ANY_VALUE = "any";

const jobListingFilterSchema = z.object({
  title: z.string().optional(),
  city: z.string().optional(),
  district: z.string().or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  locationRequirements: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
});

export function JobListingFilterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(jobListingFilterSchema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      city: searchParams.get("city") ?? "",
      locationRequirements:
        (searchParams.get("locationRequirement") as LocationRequirement) ??
        ANY_VALUE,
      district: searchParams.get("district") ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get("experience") as ExperienceLevel) ?? ANY_VALUE,
      type: (searchParams.get("type") as JobListingType) ?? ANY_VALUE,
    },
  });

  function onSubmit(data: z.infer<typeof jobListingFilterSchema>) {
    const newParams = new URLSearchParams();

    if (data.city) newParams.set("city", data.city);
    if (data.district && data.district !== ANY_VALUE) {
      newParams.set("district", data.district);
    }
    if (data.title) newParams.set("title", data.title);
    if (data.experienceLevel && data.experienceLevel !== ANY_VALUE) {
      newParams.set("experience", data.experienceLevel);
    }
    if (data.type && data.type !== ANY_VALUE) {
      newParams.set("type", data.type);
    }
    if (data.locationRequirements && data.locationRequirements !== ANY_VALUE) {
      newParams.set("locationRequirement", data.locationRequirements);
    }

    router.push(`${pathname}?${newParams.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="locationRequirements"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Requirement</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {locationRequirements.map((lr) => (
                    <SelectItem key={lr} value={lr}>
                      {formatLocationRequirement(lr)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="city"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="district"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>District</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value && field.value !== ANY_VALUE
                        ? field.value
                        : "Any"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search district..." />
                    <CommandList>
                      <CommandEmpty>No district found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value={ANY_VALUE}
                          onSelect={() => {
                            field.onChange(ANY_VALUE);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === ANY_VALUE || !field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Any
                        </CommandItem>
                        {UGANDA_DISTRICTS.map((districtName) => (
                          <CommandItem
                            value={districtName}
                            key={districtName}
                            onSelect={() => {
                              field.onChange(districtName);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                districtName === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {districtName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {jobListingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {experienceLevels.map((experienceLevel) => (
                    <SelectItem key={experienceLevel} value={experienceLevel}>
                      {formatExperienceLevel(experienceLevel)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isLoading}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Filter
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
