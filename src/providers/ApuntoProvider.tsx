"use client";
import React, { useCallback } from "react";
import { Database } from "../database.types";
import { useSupabaseContext } from "./SupabaseProvider";

type Entry = Database["public"]["Tables"]["entries"]["Row"];

interface ApuntoContextProps {
    entries: Entry[];
    addEntry: (entry: any) => Promise<void>;
    setStatus: (id: number, status: number) => Promise<void>;
    deleteEntry: (id: number) => Promise<void>;
}

const ApuntoContext = React.createContext<ApuntoContextProps>({
    entries: [],
    addEntry: async () => { },
    setStatus: async () => { },
    deleteEntry: async () => { }
})

const useApuntoContext = () => React.useContext(ApuntoContext);

const ApuntoProvider = ({ children }: { children: React.ReactNode }) => {
    const { supabase } = useSupabaseContext()
    const [entries, setEntries] = React.useState<Entry[]>([])

    const getEntries = useCallback(async () => {
        if (!supabase) return
        const { data, error } = await supabase.from("entries").select()
        if (error) {
            console.error("error", error)
            return
        }
        setEntries(data)
    }, [supabase])

    const addEntry = useCallback(async (entry: Entry) => {
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

    const setStatus = useCallback(async (id: number, status: number) => {
        if (!supabase) return
        const { data, error } = await supabase.from("entries").update({ status }).eq("id", id).select()
        console.log("data", data, "error", error)
        if (error) {
            console.error("error", error)
            return
        }
        setEntries(entries => entries.map(e => e.id === id ? { ...e, status } : e))
    }, [supabase])

    const deleteEntry = useCallback(async (id: number) => {
        if (!supabase) return
        const { data, error } = await supabase.from("entries").delete().eq("id", id).select()
        console.log("data", data, "error", error)
        if (error) {
            console.error("error", error)
            return
        }
        setEntries(entries => entries.filter(e => e.id !== id))
    }, [supabase])

    React.useEffect(() => {
        getEntries()
    }, [getEntries])

    return <ApuntoContext.Provider value={{ entries, addEntry, setStatus, deleteEntry }}>{children}</ApuntoContext.Provider>;
};

export { ApuntoProvider, useApuntoContext }