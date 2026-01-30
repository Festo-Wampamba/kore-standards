import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

function SignInLoading() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-[550px] w-[400px] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignIn />
    </Suspense>
  )
}