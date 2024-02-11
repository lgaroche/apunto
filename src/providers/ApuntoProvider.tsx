"use client";
import React, { useCallback, useMemo } from "react";
import { Database } from "../database.types";
import { useSupabaseContext } from "./SupabaseProvider";

type Entry = Database["public"]["Tables"]["entries"]["Row"];

interface ApuntoContextProps {
    entries: Entry[];
    addEntry: (entry: Partial<Entry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    updateEntry: (entry: Partial<Entry>) => Promise<void>;
}

const ApuntoContext = React.createContext<ApuntoContextProps>({
    entries: [],
    addEntry: async () => { },
    deleteEntry: async () => { },
    updateEntry: async () => { }
})

const useApuntoContext = () => React.useContext(ApuntoContext);

const ApuntoProvider = ({ children }: { children: React.ReactNode }) => {
    const { supabase } = useSupabaseContext()
    const [entries, setEntries] = React.useState<Entry[]>([])

    const getEntries = useCallback(async () => {
        if (!supabase) return
        const { data, error } = await supabase.from("entries").select().order("created_at", { ascending: false })
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
        setEntries(entries => [...entries, ...data])

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
        const { data, error } = await supabase.from("entries").update(entry).eq("id", entry.id).select()
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

    React.useEffect(() => {
        getEntries()
    }, [getEntries])

    return <ApuntoContext.Provider value={{
        entries,
        addEntry,
        deleteEntry,
        updateEntry
    }}>
        {children}
    </ApuntoContext.Provider>;
};

export { ApuntoProvider, useApuntoContext };
export type { Entry };