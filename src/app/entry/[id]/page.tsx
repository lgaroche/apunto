"use client";
import { CategoryTree } from "@/app/categories";
import { useApuntoContext, Entry } from "@/providers/ApuntoProvider";
import { useCategoryFilterContext } from "@/providers/CategoryFilter";
import React, { useCallback, useEffect } from "react";
import { FaArrowRight, FaRegFolder } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";

export default function Entry({ params }: { params: { id: string } }) {
    const { entries, categories: rawCategories, updateEntry } = useApuntoContext()
    const { categories } = useCategoryFilterContext()
    const [entry, setEntry] = React.useState<Entry | undefined>()
    const [editLabel, setEditLabel] = React.useState<string | null>(null)
    const [selected, setSelected] = React.useState<string | null>(null)
    const [selectedLabel, setSelectedLabel] = React.useState<string>("")

    useEffect(() => {
        setEntry(entries.find(e => e.id === params.id))
    }, [entries, params.id])

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

    useEffect(() => {
        if (selected) {
            setSelectedLabel(rawCategories.find(c => c.id === selected)?.label || "root")
        }
    }, [selected, rawCategories])

    if (!entry) {
        return <div>Entry not found</div>
    }

    return (
        <div className="max-w-screen-sm m-auto">
            <div className="flex p-4">
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
            <div className="max-w-screen-sm p-4">
                {selected !== null ?
                    <>
                        <div className="flex">
                            <button
                                onClick={moveEntry}
                                className="flex items-center my-2 p-2 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700">
                                <FaArrowRight className="mr-2" />
                                Move to {selectedLabel}
                            </button>
                            <button
                                onClick={() => setSelected(null)}
                                className="flex items-center ml-2 my-2 p-2 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700">
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
            <div className="max-w-screen-sm p-4">
                <textarea className="rounded-lg p-2 font-semibold w-full min-h-36 bg-slate-800 active:bg-slate-700">

                </textarea>
            </div>
        </div>
    )
}