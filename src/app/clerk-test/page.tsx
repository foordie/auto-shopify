'use client'

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'

export default function ClerkTestPage() {
  const { user } = useUser()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Clerk Authentication Test</h1>
        
        <SignedOut>
          <div className="text-center">
            <p className="mb-4 text-gray-600">You are not signed in</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center">
            <p className="mb-4 text-gray-600">Welcome back!</p>
            <div className="mb-4">
              <p className="text-sm text-gray-500">User ID: {user?.id}</p>
              <p className="text-sm text-gray-500">Email: {user?.primaryEmailAddress?.emailAddress}</p>
              <p className="text-sm text-gray-500">Name: {user?.fullName}</p>
            </div>
            <UserButton />
          </div>
        </SignedIn>
      </div>
      
      <p className="mt-4 text-sm text-gray-500">
        Visit <code>/clerk-test</code> to test Clerk authentication
      </p>
    </div>
  )
}