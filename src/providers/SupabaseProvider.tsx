"use client";
import React, { ReactNode, useMemo } from "react";
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { Database } from "../database.types";
import { useEffect } from "react";

interface SupabaseContextProps {
    supabase?: SupabaseClient<Database>
}

export const SupabaseContext = React.createContext<SupabaseContextProps>({})

const useSupabaseContext = () => React.useContext(SupabaseContext)

const SupabaseProvider = ({ children }: { children: ReactNode }) => {
    const [supabase, setSupabase] = React.useState<SupabaseClient<Database> | undefined>()

    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient<Database>(supabaseUrl, supabaseKey)
        console.log("supabase", supabase)
        setSupabase(supabase)
    }, [])

    const value = useMemo(() => ({ supabase }), [supabase])

    return (
        <SupabaseContext.Provider value={value}>
            {children}
        </SupabaseContext.Provider>
    )
}

export { useSupabaseContext, SupabaseProvider }