"use client"
import React from "react";
import { Category, useApuntoContext } from "./ApuntoProvider";

interface CategoryNode {
    id: string
    label: string | null
    children: CategoryNode[]
}

interface CategoryFilterProps {
    categories: CategoryNode[]
    selected: string[]
    select: (id: string) => void
}

const CategoryFilterContext = React.createContext<CategoryFilterProps>({
    categories: [],
    selected: [],
    select: () => { }
})

const useCategoryFilterContext = () => React.useContext(CategoryFilterContext)

const CategoryFilterProvider = ({ children }: { children: React.ReactNode }) => {
    const [categoryNodes, setCategoryNodes] = React.useState<CategoryNode[]>([])
    const [selected, setSelected] = React.useState<string[]>([])
    const { categories } = useApuntoContext()

    const select = React.useCallback((id: string) => {
        console.log("select", id)
        const list = [id]
        let parent: string | null = null
        if (id !== "root") {
            parent = id
        }
        const crawl = (parent: string | null) => {
            let children = categories.filter(c => c.parent === parent)
            for (const c of children) {
                list.push(c.id)
                crawl(c.id)
            }
        }
        crawl(parent)
        console.log("list", list)
        setSelected(list)
    }, [categories])

    React.useEffect(() => {
        const children = new Map<string, Category[]>()
        children.set("root", categories.filter(c => !c.parent))
        for (const c of categories) {
            if (c.parent) {
                if (children.has(c.parent)) {
                    children.get(c.parent)!.push(c)
                } else {
                    children.set(c.parent, [c])
                }
            }
        }
        const populate = (node: CategoryNode) => {
            if (children.has(node.id)) {
                node.children = children.get(node.id)!.map(c => ({ ...c, children: [] }))
                node.children.map(populate)
            }
        }
        const root: CategoryNode = {
            id: "root",
            label: "All categories",
            children: []
        }
        populate(root)
        console.log("root", root)
        setCategoryNodes([root])
    }, [categories])

    const value = React.useMemo(() => ({ selected, select, categories: categoryNodes }), [selected, select, categoryNodes])

    return (
        <CategoryFilterContext.Provider value={value}>
            {children}
        </CategoryFilterContext.Provider>
    )
}

export { useCategoryFilterContext, CategoryFilterProvider }
export type { CategoryNode }