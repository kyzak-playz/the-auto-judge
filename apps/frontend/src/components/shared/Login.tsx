"use client"

import React from 'react'
import { buttonVariants } from '@/components/ui/button'
import { useActionState } from 'react'
import { validateFormAction } from '@/actions/form-validation'
import { cn } from '@/lib/utils'
import { AuthUIChildProps } from '@/types/authTypes'
import { updateUserSession, useAuthStore } from '@/store/authStore'
import { FormState, FormError } from '@/schema/form-schema'


const Login = ({ authMode }: AuthUIChildProps) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<FormError['error']>()
  // Initial form state for validation 
  const initialFormState: FormState = {
    email: '',
    password: '',
    authMode ,
    result: { success: false, error: {} }
  }
  
  // Using useActionState to handle form submission state
  const [formState, formAction, isPending] = useActionState(validateFormAction, initialFormState);

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
        name='email'
        required
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
        name='password'
        required
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
        Log in
      </button>
    </form>
  )
}

export default Login