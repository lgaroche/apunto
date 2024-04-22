"use client";
import React, { useCallback, useMemo } from "react";
import { Database } from "../database.types";
import { useSupabaseContext } from "./SupabaseProvider";

type Entry = Database["public"]["Tables"]["entries"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

interface ApuntoContextProps {
    entries: Entry[];
    categories: Category[];
    addEntry: (entry: Partial<Entry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    updateEntry: (entry: Partial<Entry>) => Promise<void>;
    addCategory: (category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const ApuntoContext = React.createContext<ApuntoContextProps>({
    entries: [],
    categories: [],
    addEntry: async () => { },
    deleteEntry: async () => { },
    updateEntry: async () => { },
    addCategory: async () => { },
    deleteCategory: async () => { },
    refresh: async () => { },
})

const useApuntoContext = () => React.useContext(ApuntoContext);

const ApuntoProvider = ({ children }: { children: React.ReactNode }) => {
    const { supabase } = useSupabaseContext()
    const [entries, setEntries] = React.useState<Entry[]>([])
    const [categories, setCategories] = React.useState<Category[]>([])

    const getCategories = useCallback(async () => {
        if (!supabase) return
        const { data, error } = await supabase.from("categories").select()
        if (error) {
            console.error("error", error)
            return
        }
        console.log("categories", data)
        setCategories(data)
    }, [supabase])

    const getEntries = useCallback(async () => {
        if (!supabase) return
        const { data, error } = await supabase
            .from("entries")
            .select()
            .order("modified_at", { ascending: false })
        if (error) {
            console.error("error", error)
            return
        }
        setEntries(data)
    }, [supabase])

    const addEntry = useCallback(async (entry: Partial<Entry>) => {
        console.log("new entry", entry)
        if (!supabase) return
        const { data, error } = await supabase.from("entries").insert(entry).select()
        console.log("data", data, "error", error)
        if (error) {
            console.error("error", error)
            return
        }
        setEntries(entries => [...data, ...entries])

    }, [supabase])

    const deleteEntry = useCallback(async (id: string) => {
        if (!supabase) return
        const { data, error } = await supabase.from("entries").delete().eq("id", id).select()
        console.log("data", data, "error", error)
        if (error) {
            console.error("error", error)
            return
        }
        setEntries(entries => entries.filter(e => e.id !== id))
    }, [supabase])

    const updateEntry = useCallback(async (entry: Partial<Entry>) => {
        if (!supabase || !entry.id) return
        const { data, error } = await supabase.from("entries").update({ ...entry, modified_at: (new Date).toISOString() }).eq("id", entry.id).select()
        console.log("data", data, "error", error)
        if (error) {
            console.error("error", error)
            return
        }
        if (data.length < 1) {
            console.error("no data")
            return
        }
        setEntries(entries => entries.map(e => e.id === entry.id ? data[0] : e))
    }, [supabase])

    const addCategory = useCallback(async (category: Partial<Category>) => {
        if (!supabase) return
        const { data, error } = await supabase.from("categories").insert(category).select()
        if (error) {
            console.error("error", error)
            return
        }
        setCategories(categories => [...categories, ...data])
    }, [supabase])

    const deleteCategory = useCallback(async (id: string) => {
        if (!supabase) return
        const category = categories.find(c => c.id === id)
        if (!category) return
        {
            // update all child categories to parent
            const { data, error } = await supabase
                .from("categories")
                .update({ parent: category.parent })
                .eq("parent", id)
                .select()
            if (error) {
                console.error("error", error)
                return
            }
        }
        {
            // update all entries to parent
            const { data, error } = await supabase
                .from("entries")
                .update({ category: category.parent })
                .eq("category", id)
                .select()
            if (error) {
                console.error("error", error)
                return
            }
        }
        const { data, error } = await supabase.from("categories").delete().eq("id", id).select()
        if (error) {
            console.error("error", error)
            return
        }
        getCategories()
        getEntries()
    }, [categories, getCategories, getEntries, supabase])

    const refresh = useCallback(async () => {
        await getCategories()
        await getEntries()
    }, [getCategories, getEntries])

    const value = useMemo(() => ({
        entries,
        categories,
        addEntry,
        deleteEntry,
        updateEntry,
        addCategory,
        deleteCategory,
        refresh
    }), [entries, categories, addEntry, deleteEntry, updateEntry, addCategory, deleteCategory, refresh])

    return <ApuntoContext.Provider value={value}>
        {children}
    </ApuntoContext.Provider>;
};

export { ApuntoProvider, useApuntoContext };
export type { Entry, Category };
