"use client"
import { useEffect, useState } from 'react'
import { login, reset, signup } from './actions'
import { CgSpinner } from 'react-icons/cg'
import { useFormState } from 'react-dom'

export default function LoginPage() {

    const [loading, setLoading] = useState(false)
    const [state, formAction] = useFormState(login, { error: undefined })

    useEffect(() => {
        setLoading(false)
    }, [state])

    return (
        <>
            {state.error && (
                <div className="m-5 rounded-lg border-red-900 bg-red-300 text-red-900 p-3">
                    <p className='font-bold'>{state.error.name}</p>
                    <p>{state.error.message}</p>
                </div>
            )}
            <form className="flex flex-col justify-center p-5 max-w-sm mx-auto" action={formAction} onSubmit={() => setLoading(true)}>
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={loading}
                    className="my-3 font-semibold focus:outline-none focus:outline-slate-500 text-lg py-1 px-2 rounded-lg dark:bg-slate-600" />
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    disabled={loading}
                    className="my-3 font-semibold focus:outline-none focus:outline-slate-500 text-lg py-1 px-2 rounded-lg dark:bg-slate-600" />
                <button
                    disabled={loading}
                    className="mt-3 font-semibold text-lg py-1 px-2 rounded-lg dark:bg-blue-600 hover:dark:bg-blue-500 active:hover:dark:bg-blue-500">
                    {loading ? <CgSpinner className="animate-spin inline-block" /> : "Log in"}
                </button>
                <button
                    disabled={loading}
                    className="mt-2 font-semibold text-lg py-1 px-2 rounded-lg dark:bg-slate-600 hover:dark:bg-slate-500 active:hover:dark:bg-slate-500">
                    Sign up
                </button>
                <button
                    disabled={loading}
                    className="mt-2 font-semibold text-lg py-1 px-2 rounded-lg dark:bg-slate-600 hover:dark:bg-red-500 active:hover:dark:bg-red-500">
                    Reset password
                </button>
            </form>
        </>
    )
}