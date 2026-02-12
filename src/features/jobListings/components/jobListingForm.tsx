"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { jobListingSchema } from "../actions/schemas";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  wageIntervals,
  locationRequirements,
  jobListingTypes,
  experienceLevels,
  JobListingTable,
} from "@/drizzle/schema";
import {
  formatWageInterval,
  formatLocationRequirement,
  formatJobType,
  formatExperienceLevel,
} from "../lib/formatters";
import districts from "@/data/districts.json";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { LoadingSwap } from "@/components/LoadingSwap";
import { createJobListing, updateJobListing } from "../actions/actions";
import { toast } from "sonner";
export function JobListingForm({
  jobListing,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "title"
    | "description"
    | "experienceLevel"
    | "id"
    | "district"
    | "type"
    | "wage"
    | "wageInterval"
    | "city"
    | "locationRequirement"
  >;
}) {
  const form = useForm<z.infer<typeof jobListingSchema>>({
    resolver: zodResolver(jobListingSchema),
    defaultValues: jobListing ?? {
      title: "",
      description: "",
      experienceLevel: "junior",
      locationRequirement: "in-office",
      type: "full-time",
      wage: undefined,
      wageInterval: "monthly",
      district: undefined,
      city: undefined,
    },
  });
  const [openDistrict, setOpenDistrict] = useState(false);
  const locationType = useWatch({
    control: form.control,
    name: "locationRequirement",
  });
  async function onSubmit(data: z.infer<typeof jobListingSchema>) {
    const action = jobListing
      ? updateJobListing.bind(null, jobListing.id)
      : createJobListing;
    const response = await createJobListing(data);
    if (response?.error) {
      toast.error(response.message);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ================= ROW 1: TITLE & WAGE ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Software Engineer" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Wage</FormLabel>
            <div className="flex">
              <FormField
                control={form.control}
                name="wage"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Amount"
                        className="rounded-r-none"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.valueAsNumber;
                          field.onChange(isNaN(val) ? null : val);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wageInterval"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[130px] rounded-l-none border-l-0">
                          <span className="text-muted-foreground pr-1">/</span>
                          <SelectValue placeholder="Interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wageIntervals.map((interval) => (
                          <SelectItem key={interval} value={interval}>
                            {formatWageInterval(interval)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormDescription>Leave blank if not applicable.</FormDescription>
            <FormMessage />
          </FormItem>
        </div>
        {/* ================= ROW 2: LOCATION (Now Second) ================= */}
        {locationType !== "remote" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* DISTRICT SELECTOR */}
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>District</FormLabel>
                  <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openDistrict}
                          className={cn(
                            "w-full justify-between pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? districts.find((d) => d === field.value)
                              : "Select district"}
                          </span>
                          {/* Icons: X if selected, Chevron if empty */}
                          {field.value ? (
                            <div
                              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 hover:text-red-500 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                form.setValue("district", undefined);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </div>
                          ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search district..." />
                        <CommandList>
                          <CommandEmpty>No district found.</CommandEmpty>
                          <CommandGroup className="max-h-[250px] overflow-y-auto">
                            {districts.map((district) => (
                              <CommandItem
                                value={district}
                                key={district}
                                onSelect={() => {
                                  form.setValue("district", district);
                                  setOpenDistrict(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    district === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {district}
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
            {/* CITY INPUT */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / Town</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Bugolobi, Nakawa"
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {/* ================= ROW 3: CATEGORIES (Now Third) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* 1. JOB TYPE */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
          {/* 2. WORKPLACE TYPE (Controls visibility of Row 2) */}
          <FormField
            control={form.control}
            name="locationRequirement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workplace Type</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    // Clear Row 2 data if switching to Remote
                    if (val === "remote") {
                      form.setValue("district", undefined);
                      form.setValue("city", undefined);
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locationRequirements.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatLocationRequirement(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 3. EXPERIENCE LEVEL */}
          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatExperienceLevel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <MarkdownEditor
                  {...field}
                  markdown={jobListing?.description || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            <span className="sr-only">Creating job listing...</span>
          </LoadingSwap>
          Create Job Listing
        </Button>
      </form>
    </Form>
  );
}
