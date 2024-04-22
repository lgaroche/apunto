"use client";
import { CategoryTree } from "@/app/categories";
import { useApuntoContext, Entry } from "@/providers/ApuntoProvider";
import { useCategoryFilterContext } from "@/providers/CategoryFilter";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { CgSpinner } from "react-icons/cg";
import { FaArrowRight, FaEdit, FaRegFolder } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import Markdown from "react-markdown";

export default function EntryPage({ params }: { params: { id: string } }) {
    const { supabase } = useSupabaseContext()
    const { entries, categories: rawCategories, refresh, updateEntry } = useApuntoContext()
    const { categories } = useCategoryFilterContext()
    const [user, setUser] = React.useState<User | null>(null)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [entry, setEntry] = React.useState<Entry | undefined>()
    const [editLabel, setEditLabel] = React.useState<string | null>(null)
    const [selected, setSelected] = React.useState<string | null>(null)
    const [selectedLabel, setSelectedLabel] = React.useState<string>("")
    const [editText, setEditText] = React.useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        console.log("entries", entries)
        setEntry(entries.find(e => e.id === params.id))
    }, [entries, params.id])

    useEffect(() => {
        if (!supabase) return
        const load = async () => {
            const { data, error } = await supabase.auth.getUser()
            if (error) console.error(error)
            const { user } = data
            if (!user) {
                router.push("/login")
                return
            }
            console.log("auth data", data)
            setUser(data?.user)
            await refresh()
            setLoading(false)
        }
        load()
    }, [refresh, router, supabase])

    const updateLabel = useCallback(async () => {
        if (!entry || editLabel === null) return
        setEditLabel(null)
        updateEntry({ id: entry.id, label: editLabel })
    }, [entry, editLabel, updateEntry])

    const moveEntry = useCallback(async () => {
        if (!entry || selected === undefined) return
        updateEntry({ id: entry.id, category: selected })
        setSelected(null)
    }, [entry, selected, updateEntry])

    const saveEntry = useCallback(async () => {
        if (!entry || editText === null) return
        setEditText(null)
        updateEntry({ id: entry.id, text: editText })
    }, [editText, entry, updateEntry])

    useEffect(() => {
        if (selected) {
            setSelectedLabel(rawCategories.find(c => c.id === selected)?.label || "root")
        }
    }, [selected, rawCategories])

    if (!user || loading) return (
        <div className="flex justify-center items-center h-screen">
            <CgSpinner className="animate-spin text-6xl" />
        </div>
    )

    if (!entry) {
        return <div className="flex justify-center items-center h-screen">Entry not found</div>
    }

    return (
        <div className="max-w-screen-sm m-auto h-screen flex flex-col">
            <div className="flex flex-none mt-2">
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
                        className="text-4xl font-semibold"
                        onClick={() => setEditLabel(entry.label)}>
                        {entry?.label}
                    </button>
                }
            </div>
            <div className="flex-none max-w-screen-sm pb-4 mt-2">
                {selected !== null ?
                    <>
                        <div className="flex">
                            <button
                                onClick={moveEntry}
                                className="flex items-center my-2 p-2 rounded-lg font-semibold bg-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                                <FaArrowRight className="mr-2" />
                                Move to {selectedLabel}
                            </button>
                            <button
                                onClick={() => setSelected(null)}
                                className="flex items-center ml-2 my-2 p-2 rounded-lg font-semibold bg-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                                <MdOutlineCancel className="mr-2" />
                                Cancel
                            </button>
                        </div>
                        <ul>
                            <CategoryTree
                                category={categories[0]}
                                level={0}
                                select={setSelected}
                                selected={selected !== undefined ? [selected] : []} />
                        </ul>
                    </>
                    :
                    <div className="flex items-center hover:text-blue-600">
                        <FaRegFolder className="mr-2" />
                        <button
                            className="font-semibold"
                            onClick={() => {
                                if (entry.category) {
                                    setSelected(entry.category)
                                } else {
                                    setSelected("root")
                                }
                            }}>
                            {rawCategories.find(c => c.id === entry.category)?.label || "None"}
                        </button>
                    </div>
                }

            </div>

            <div className="flex flex-col max-w-screen-sm p-4 rounded-lg border-slate-300 border">
                {editText === null ?
                    <div className="flex flex-col">
                        <button
                            className="flex mb-5 w-fit items-baseline p-2 rounded-lg bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-blue-200"
                            onClick={() => setEditText(entry.text ?? "")}>
                            <FaEdit className="mr-2" />
                            Edit
                        </button>
                        <Markdown className="grow p-2 markdown">{entry.text}</Markdown>
                    </div>
                    :
                    <>
                        <button
                            className="flex w-fit mb-5 items-baseline p-2 rounded-lg bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-blue-200"
                            onClick={saveEntry}>
                            Save
                        </button>
                        <textarea
                            className="rounded-lg p-2 w-full h-full min-h-80 dark:bg-slate-800 dark:text-slate-200 bg-slate-200"
                            value={editText ?? ""}
                            onChange={e => setEditText(e.target.value)}>
                        </textarea>
                    </>
                }

            </div>
        </div>
    )
}