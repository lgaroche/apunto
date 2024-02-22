"use client"
import { useCallback, useEffect, useState } from 'react'
import { login, reset, signup } from './actions'
import { CgSpinner } from 'react-icons/cg'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const params = useSearchParams()
    const errorParam = params.get("error")
    const errorMessage = params.get("error_description")
    const code = params.get("error_code")
    const timestamp = params.get("t")

    const [error, setError] = useState<Error | undefined>()
    const [loading, setLoading] = useState(false)

    const handleSubmit = useCallback(() => {
        setError(undefined)
        setLoading(true)
    }, [])

    useEffect(() => {
        if (!errorParam) {
            setError(undefined)
        }
        const name = `${code} ${errorParam}`
        setError({
            name,
            message: errorMessage ?? "",
        })
    }, [code, errorParam, errorMessage, timestamp])

    useEffect(() => {
        if (error?.message && error.name) {
            console.error(error)
            setLoading(false)
        }
    }, [error])

    return (
        <>
            {error?.message && error.name && (
                <div className="m-5 rounded-lg border-red-900 bg-red-300 text-red-900 p-3">
                    <p className='font-bold'>{error.name}</p>
                    <p>{error.message}</p>
                </div>
            )}
            <form className="flex flex-col justify-center p-5 max-w-sm mx-auto" onSubmit={handleSubmit}>
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
                    formAction={login}
                    disabled={loading}
                    className="mt-3 font-semibold text-lg py-1 px-2 rounded-lg dark:bg-blue-600 hover:dark:bg-blue-500 active:hover:dark:bg-blue-500">
                    {loading ? <CgSpinner className="animate-spin inline-block" /> : "Log in"}
                </button>
                <button
                    formAction={signup}
                    disabled={loading}
                    className="mt-2 font-semibold text-lg py-1 px-2 rounded-lg dark:bg-slate-600 hover:dark:bg-slate-500 active:hover:dark:bg-slate-500">
                    Sign up
                </button>
                <button
                    formAction={reset}
                    disabled={loading}
                    className="mt-2 font-semibold text-lg py-1 px-2 rounded-lg dark:bg-slate-600 hover:dark:bg-red-500 active:hover:dark:bg-red-500">
                    Reset password
                </button>
            </form>
        </>
    )
}