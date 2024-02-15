
import { CategoryNode, useCategoryFilterContext } from "@/providers/CategoryFilter";
import React, { useCallback, useState } from "react";
import { FaAngleDown, FaAngleRight, FaFolderPlus, FaPlus, FaRegAddressBook } from "react-icons/fa";


interface InnerCategoryProps {
    category: CategoryNode
    level: number
    open: (id: string) => void
    close: (id: string) => void
    select: (id: string) => void
    selected: string[]
    opened: string[]
}

const InnerCategory = ({ category, level, open, close, select, selected, opened }: InnerCategoryProps) => (
    <li key={category.id} className={`${selected.length > 0 && category.id === selected[0] && "bg-sky-200 rounded-lg text-blue-500 font-semibold dark:bg-blue-950"} ${level > 0 ? "ml-4" : ""}`}>
        <div
            className={`group flex items-center p-1 hover:bg-sky-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer`}>
            <button
                className={`flex items-center ml-1 w-full text-left`}
                onClick={() => select(category.id)}>

                {category.label}
                <FaPlus className="invisible group-hover:visible hover:text-blue-600 ml-2" />
            </button>
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
            category.children.length > 0 && opened.indexOf(category.id) > -1 && (
                <ul>
                    {category.children.map(child => (
                        <InnerCategory
                            key={child.id}
                            category={child}
                            level={level + 1}
                            open={open}
                            close={close}
                            select={select}
                            selected={selected}
                            opened={opened} />
                    ))}
                </ul>
            )
        }
    </li >
)

export default function Categories() {
    const { categories, selected, select } = useCategoryFilterContext()

    const [opened, setOpened] = useState<string[]>([])

    const close = useCallback((id: string) => {
        console.log("close", id)
        setOpened(opened.filter(o => o !== id))
    }, [opened])

    const open = useCallback((id: string) => {
        console.log("open", id)
        setOpened([...opened, id])
    }, [opened])

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
                        <InnerCategory
                            key={category.id}
                            category={category}
                            level={0}
                            open={open}
                            close={close}
                            select={select}
                            selected={selected}
                            opened={opened}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )
}