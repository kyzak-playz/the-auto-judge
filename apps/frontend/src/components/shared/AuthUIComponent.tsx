"use client"

import React from "react";
import SignIn from './SignIn'
import Login from './Login'
import { useAuthStore } from "@/store/authStore"

/**
 * AuthUIComponent is a modal dialog that provides an interface for users to either sign in or log in. 
 * It features a toggle switch to switch between the two modes and a close button to exit the dialog. 
 * The component uses React state to manage the current mode and interacts with the auth store to control the visibility of the dialog.
*/
const AuthUIComponent = () => {
  const [mode, setMode] = React.useState<'signin' | 'login'>('signin');
  const setAuthOpen = useAuthStore((state) => state.setAuthOpen);

  return (
    // Overlay container
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 lg:w-1/3 md:w-2/3 rounded-2xl bg-zinc-900/80 p-6 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-100">Welcome</h3>
            <p className="text-sm text-zinc-400">
              {mode === 'signin' ? 'Create an account' : 'Login into the existing account'}
            </p>
          </div>
          {/* Close Button to close the auth dialog */}
          <button
            onClick={() => setAuthOpen(false)}
            className="text-sm text-zinc-300 hover:text-zinc-100"
            aria-label="Close auth dialog"
          >
            Close
          </button>
        </div>

        <div className="mb-6">
          <div className="relative inline-flex h-10 w-64 items-center rounded-full bg-zinc-800 p-1">
            <div
              className={`absolute top-1/2 left-4 transform -translate-y-1/2 transition-all duration-200 ${mode === 'signin' ? 'translate-x-0' : 'translate-x-31'}`}
              style={{ width: '6rem', height: '2rem', borderRadius: '9999px', backgroundColor: '#111827' }}
            />

            <button
              onClick={() => setMode('signin')}
              className={`relative z-10 w-1/2 text-sm font-medium ${mode === 'signin' ? 'text-zinc-100' : 'text-zinc-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('login')}
              className={`relative z-10 w-1/2 text-sm font-medium ${mode === 'login' ? 'text-zinc-100' : 'text-zinc-400'}`}
            >
              Login
            </button>
          </div>
        </div>
        {/* Conditionally render SignIn or Login component based on the selected mode */}
        <div className="bg-zinc-800/60 rounded-lg p-6">
          {mode === 'signin' ? <SignIn authMode="signup" /> : <Login authMode="login" />}
        </div>
      </div>
    </div>
  )
}

export default AuthUIComponent