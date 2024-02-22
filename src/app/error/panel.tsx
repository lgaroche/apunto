"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export const ErrorPanel = ({ onChange, show }: { onChange: (err: boolean) => void, show: boolean }) => {
    const params = useSearchParams()
    const errorParam = params.get("error")
    const errorMessage = params.get("error_description")
    const code = params.get("error_code")
    const timestamp = params.get("t")

    const [error, setError] = useState<Error | undefined>()

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
            onChange(true)
        } else {
            onChange(false)
        }
    }, [error, onChange])

    useEffect(() => {
        if (!show) {
            setError(undefined)
        }
    }, [show])

    return (
        <>
            {error?.message && error.name && (
                <div className="m-5 rounded-lg border-red-900 bg-red-300 text-red-900 p-3">
                    <p className='font-bold'>{error.name}</p>
                    <p>{error.message}</p>
                </div>
            )}
        </>
    )
}