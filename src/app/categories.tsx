
import { useApuntoContext } from "@/providers/ApuntoProvider";
import { CategoryNode, useCategoryFilterContext } from "@/providers/CategoryFilter";
import React, { useCallback, useRef, useState } from "react";
import { FaAngleDown, FaAngleRight, FaFolderPlus, FaPlus, FaTrash } from "react-icons/fa";
interface InnerCategoryProps {
    category: CategoryNode
    level: number
    select: (id: string) => void
    selected: string[]
}

const CategoryTree = ({ category, level, select, selected }: InnerCategoryProps) => {

    const { addCategory, deleteCategory } = useApuntoContext()
    const [opened, setOpened] = useState<string[]>(["root"])
    const [inserting, setInserting] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setDeleting(null)
        }
    }, [])

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [handleClickOutside])

    const close = useCallback((id: string) => {
        console.log("close", id)
        setOpened(opened.filter(o => o !== id))
    }, [opened])

    const open = useCallback((id: string) => {
        console.log("open", id)
        setOpened([...opened, id])
    }, [opened])

    const insertCategory = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!inserting) return
        console.log("inserting", inserting)
        await addCategory({ label: inserting, parent: category.id === "root" ? null : category.id })
        setInserting(null)
        open(category.id)
    }, [addCategory, category.id, inserting, open])

    const selectedClass = "bg-sky-200 rounded-lg text-blue-500 font-semibold dark:bg-blue-950"

    return (
        <>
            {deleting === category.id ? (
                <div ref={ref}>
                    <button
                        onClick={() => {
                            deleteCategory(category.id)
                            setDeleting(null)
                        }}
                        className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-700 w-full">
                        Delete?
                    </button>
                </div>
            ) : (
                <li key={category.id} className={`${selected.length > 1 && category.id === selected[0] ? selectedClass : ""} ${level > 0 ? "ml-4" : ""}`}>
                    <div
                        className={`
                            group flex items-center p-1 hover:bg-sky-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer 
                            ${selected.length === 1 && category.id === selected[0] ? selectedClass : ""}
                            `}>
                        <div
                            className={`flex items-center ml-1 w-full text-left`}
                            onClick={() => select(category.id)}>
                            <div className="grow">
                                {category.label}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setInserting("")
                                }}
                                className={`invisible ${category.id === selected[0] ? "group-hover:visible" : ""} hover:text-blue-600 ml-2`}>
                                <FaPlus />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleting(category.id)
                                }}
                                className={`invisible ${category.id !== "root" && category.id === selected[0] ? "group-hover:visible" : ""} hover:text-red-600 ml-2`}>
                                <FaTrash />
                            </button>
                        </div>
                        {opened.indexOf(category.id) > -1 ?
                            <button
                                className="pl-2 hover:text-blue-600"
                                onClick={() => close(category.id)}>
                                <FaAngleDown />
                            </button> :
                            category.children.length > 0 &&
                            <button
                                className="pl-2 hover:text-blue-600"
                                onClick={() => open(category.id)}>
                                <FaAngleRight />
                            </button>
                        }
                    </div>
                    {
                        inserting !== null && (
                            <div>
                                <form onSubmit={insertCategory} className="flex">
                                    <input
                                        type="text"
                                        placeholder="Label"
                                        value={inserting ?? ""}
                                        onChange={e => setInserting(e.target.value)}
                                        onBlur={() => setInserting(null)}
                                        onKeyUp={e => e.key === "Enter" && setInserting(null)}
                                        className="w-full m-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                                    />
                                </form>
                            </div>
                        )
                    }
                    {
                        category.children.length > 0 && opened.indexOf(category.id) > -1 && (
                            <ul>
                                {category.children.map(child => (
                                    <CategoryTree
                                        key={child.id}
                                        category={child}
                                        level={level + 1}
                                        select={select}
                                        selected={selected} />
                                ))}
                            </ul>
                        )
                    }
                </li >
            )}
        </>
    )
}

function Categories() {
    const { categories, selected, select } = useCategoryFilterContext()

    return (
        <div className="flex flex-col">
            <div className="mb-5 flex">
                <div className="flex mb-2 h-10">
                    <button className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mr-2 hover:bg-slate-600 dark:hover:bg-slate-900">
                        <FaFolderPlus />
                    </button>
                    <button className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mr-2 hover:bg-slate-600 dark:hover:bg-slate-900">
                        <FaFolderPlus />
                    </button>
                </div>
            </div>
            <div>
                <ul>
                    {categories.map(category => (
                        <CategoryTree
                            key={category.id}
                            category={category}
                            level={0}
                            select={select}
                            selected={selected}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )
}

export { Categories, CategoryTree }