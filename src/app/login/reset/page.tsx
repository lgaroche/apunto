"use client"
import { Suspense, useCallback, useState } from 'react'
import { update } from '../actions'
import { CgSpinner } from 'react-icons/cg'
import { ErrorPanel } from '../../error/panel'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<boolean>(false)

    const handleSubmit = useCallback(() => {
        setError(false)
        setLoading(true)
    }, [])

    return (
        <>
            <Suspense>
                <ErrorPanel show={error} onChange={(err) => {
                    setError(err)
                    setLoading(false)
                }} />
            </Suspense>
            <form className="flex flex-col justify-center p-5 max-w-sm mx-auto" onSubmit={handleSubmit}>
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={loading}
                    className="my-3 font-semibold focus:outline-none focus:outline-slate-500 text-lg py-1 px-2 rounded-lg dark:bg-slate-600" />

                <button
                    formAction={update}
                    disabled={loading}
                    className="mt-2 font-semibold text-lg py-1 px-2 rounded-lg dark:bg-red-600 hover:dark:bg-red-500 active:hover:dark:bg-red-500">
                    {loading ? <CgSpinner className="animate-spin inline" /> : "Reset"}
                </button>
            </form>
        </>
    )
}