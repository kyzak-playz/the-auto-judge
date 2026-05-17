"use client"

import React from 'react'
import { buttonVariants } from '@/components/ui/button'
import { useActionState } from 'react'
import { validateFormAction } from '@/actions/form-validation'
import { cn } from '@/lib/utils'
import { AuthUIChildProps } from '@/types/authTypes'
import { updateUserSession, useAuthStore } from '@/store/authStore'
import { FormError, FormState } from '@/schema/form-schema'

/**
 * SignIn component provides a form for users to create an account. 
 * It includes fields for email and password, and handles form submission using the useActionState hook. 
 * The component also displays validation errors and updates the user session upon successful sign-in.
 */
const SignIn = ({ authMode }: AuthUIChildProps) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<FormError['error']>()
  
  const initialFormState: FormState = {
      email: '',
      password: '',
      authMode ,
      result: { success: false, error: {} }
    }

  // Using useActionState to handle form submission state
  const [formState, formAction, isPending] = useActionState(validateFormAction, initialFormState)

  // Effect to update user session and close auth dialog on successful sign-in
  React.useEffect(() => {
      if (formState.result.success === true) {
        updateUserSession(formState.result.data);
        useAuthStore.getState().setAuthOpen(false);
        setError(undefined);
        return;
      }
  
      // Normalize the error shape so it matches FormError
      const e: FormError['error'] = formState.result.error
  
      setError({
        email: e.email,
        password: e.password,
        general: e.general,
      });
    }, [formState, isPending]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="text-sm text-zinc-300">Email</label>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md bg-zinc-800/70 px-3 py-2 text-zinc-100"
        required
        name='email'
      />
      <p className={cn("text-sm text-red-500", !error?.email && 'hidden')}>
        {error?.email?.map((error, index) => (
          <span key={index}>{error}<br /></span>
        ))}
      </p>

      <label className="text-sm text-zinc-300">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-md bg-zinc-800/70 px-3 py-2 text-zinc-100"
        required
        name='password'
      />
      <p className={cn("text-sm text-red-500", !error?.password && 'hidden')}>
        {error?.password?.map((error, index) => (
          <span key={index}>{error}<br /></span>
        ))}
      </p>

      {/* General errors */}
      {error?.general && (
        <p className="text-sm text-red-500">
          {error.general}
        </p>
      )}
      
      <button type="submit" className={buttonVariants({ variant: 'default', className: cn('mt-2', isPending && 'cursor-not-allowed opacity-50') })} disabled={isPending}>
        {!isPending ? 'Creating account' : ButtonSpinner}
      </button>
    </form>
  )
}

const ButtonSpinner = (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

export default SignIn