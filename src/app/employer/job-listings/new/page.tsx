import { Card, CardContent } from "@/components/ui/card";
import { JobListingForm } from "@/features/jobListings/components/jobListingForm";

export default function NewJobListingPage() {
    return <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">New Job Listing</h1>
        <p className="text-muted-foreground mb-6">This page does not post any listing yet. It just saves a draft.</p>
        <Card>
            <CardContent>
                <JobListingForm />
            </CardContent>
        </Card>
    </div>
}