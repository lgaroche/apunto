"use client";
import { useApuntoContext, Entry } from "@/providers/ApuntoProvider";
import React, { useCallback, useEffect } from "react";

export default function Entry({ params }: { params: { id: string } }) {
    const { entries, updateEntry } = useApuntoContext()
    const [entry, setEntry] = React.useState<Entry | undefined>()
    const [editLabel, setEditLabel] = React.useState<string | null>(null)

    useEffect(() => {
        setEntry(entries.find(e => e.id === params.id))
    }, [entries, params.id])

    const updateLabel = useCallback(async () => {
        if (!entry || editLabel === null) return
        setEditLabel(null)
        updateEntry({ id: entry.id, label: editLabel })
    }, [entry, editLabel, updateEntry])

    if (!entry) {
        return <div>Entry not found</div>
    }

    return (
        <div className="flex justify-center p-2">
            {editLabel !== null ?
                <div className="">
                    <input
                        className="bg-slate-300 p-2 rounded-lg dark:bg-slate-800 dark:text-white"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)} />
                    <button
                        onClick={updateLabel}
                        className="ml-2 p-2 rounded-lg hover:bg-slate-700">
                        Set
                    </button>
                </div>
                :
                <button
                    className="text-lg font-semibold"
                    onClick={() => setEditLabel(entry.label)}>
                    {entry?.label}
                </button>
            }
        </div>
    )
}