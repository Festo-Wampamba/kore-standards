import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

function SignUpLoading() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-[550px] w-[400px] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<SignUpLoading />}>
        <SignUp />
      </Suspense>
    </div>
  );
}
