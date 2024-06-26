"use client";
import { Entry, useApuntoContext } from "@/providers/ApuntoProvider";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { FaCheck, FaEdit, FaPlus, FaRegCalendar, FaTrash } from "react-icons/fa";
import { FaDeleteLeft, FaFolderTree } from "react-icons/fa6";
import { Categories } from "./categories";
import { useCategoryFilterContext } from "@/providers/CategoryFilter";
import { useRouter } from "next/navigation";
import { MdAccessAlarm } from "react-icons/md";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { BiLogOut, BiRefresh } from "react-icons/bi";
import { CgSpinner } from "react-icons/cg";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { User } from "@supabase/supabase-js";

enum Status {
  Urgent = 1,
  New = 2,
  Waiting = 4,
  Done = 8
}

const StatusIcon = ({ status, className }: { status: Status, className?: string }) => {
  switch (status) {
    case Status.New:
      return <FaPlus className={`text-blue-600 ${className ?? ""}`} />
    case Status.Waiting:
      return <FaRegCalendar className={`text-slate-800 dark:text-slate-400 ${className ?? ""}`} />
    case Status.Urgent:
      return <MdAccessAlarm className={`text-red-600 ${className ?? ""}`} />
    case Status.Done:
      return <FaCheck className={`text-green-600 ${className ?? ""}`} />
    default:
      return ""
  }
}

interface ActionsProps {
  entry: Entry
  updateEntry: (entry: Partial<Entry>) => Promise<void>
  setDeletePending: (id: string) => void
}

const Actions = ({ entry, updateEntry, setDeletePending }: ActionsProps) => (
  <>
    {[Status.New, Status.Waiting, Status.Urgent, Status.Done].map(status => {
      return (
        <button
          key={status}
          disabled={status.valueOf() === entry.status}
          onClick={() => updateEntry({ id: entry.id, status })}
          className={`text-2xl ${status.valueOf() === entry.status ? "opacity-25" : ""} mr-3`}>
          <StatusIcon status={status} className={"hover:text-blue-400"} />
        </button>
      )
    })
    }
    <Link
      href={`/entry/${entry.id}`}
      shallow={true}
      className="ml-4 text-2xl text-slate-700 hover:text-blue-400">
      <FaEdit />
    </Link>
    <button
      className="mr-2 text-slate-700 hover:text-red-600 text-2xl"
      onClick={() => setDeletePending(entry.id)}>
      <FaTrash />
    </button></>
)

export default function Home() {
  const { entries, categories, addEntry, updateEntry, deleteEntry, refresh } = useApuntoContext()
  const { selected } = useCategoryFilterContext()
  const { supabase } = useSupabaseContext()

  const [user, setUser] = useState<User | null>()
  const [statusFilter, setStatusFilter] = useState<number>(0)
  const [textFilter, setTextFilter] = useState<string>("")
  const [newEntry, setNewEntry] = useState<string | undefined>()
  const [deletePending, setDeletePending] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [entrySelected, setEntrySelected] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(true)

  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter()

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setDeletePending(undefined)
    }
  }, [])

  const toggleStatusFilter = useCallback((status: number) => {
    setStatusFilter(s => s ^ status)
  }, [])

  const submitNewEntry = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newEntry) return
    addEntry({
      category: selected[0] === "root" ? null : selected[0],
      status: Status.New,
      label: newEntry
    })
    setNewEntry("")
  }, [addEntry, newEntry, selected])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handleClickOutside])

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(o => !o)
  }, [])

  const handleRefresh = useCallback(async () => {
    setLoading(true)
    await refresh()
    setLoading(false)
  }, [refresh])

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

  const handleLogout = useCallback(async () => {
    if (!user || !supabase) return
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }, [router, supabase, user])

  if (!user) return (
    <div className="flex justify-center items-center h-screen">
      <CgSpinner className="animate-spin text-6xl" />
    </div>
  )

  return (
    <div className="m-auto flex max-w-screen-lg">
      <div className={`p-5 max-w-96 ${drawerOpen ? "basis-4/5" : "basis-1/3 hidden sm:block"}`}>
        <Categories close={() => setDrawerOpen(false)} />
      </div>
      <div className={`p-5 overflow-hidden w-full ${drawerOpen ? "" : ""}`}>
        <div className="flex mb-5 flex-col text-xl">
          <div className="flex mb-2">

            <button
              className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mr-2 sm:hidden"
              onClick={toggleDrawer} >
              <FaFolderTree />
            </button>

            <button
              onClick={() => setNewEntry("")}
              className="grow flex items-center font-semibold text-slate-50 bg-blue-500 hover:bg-blue-300 hover:dark:bg-blue-600 dark:bg-blue-800 p-2 rounded-lg mr-2">
              <HiOutlineDocumentAdd className="mr-2" />
              Create
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="grow flex items-center font-semibold text-slate-50 hover:bg-green-400 bg-green-500 hover:dark:bg-teal-600 dark:bg-teal-800 p-2 rounded-lg">

              {loading ?
                <>
                  <CgSpinner className={`animate-spin mr-2`} /> Loading...
                </>
                :
                <>
                  <BiRefresh className="mr-2" /> Refresh
                </>
              }
            </button>

            <button
              onClick={handleLogout}
              className=" flex items-center font-semibold text-slate-50 bg-red-500 hover:bg-red-300 hover:dark:bg-red-600 dark:bg-red-800 p-2 rounded-lg ml-2">
              <BiLogOut className="mr-1" />
            </button>
          </div>

          <div className="flex">
            {[Status.New, Status.Waiting, Status.Urgent, Status.Done].map(status => {
              return (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`bg-slate-50 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700 ${(statusFilter & status) > 0 ? "opacity-25" : ""} p-2 rounded-lg mr-2`}>
                  <StatusIcon status={status} />
                </button>
              )
            })}
            <input
              value={textFilter}
              onChange={e => setTextFilter(e.target.value)}
              type="text"
              placeholder="Filter"
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800" />
          </div>

        </div>
        <div className="flex flex-col text-xl">
          {newEntry !== undefined && (
            <div className="mb-5">
              <form onSubmit={submitNewEntry} className="flex">
                <input
                  placeholder="New entry"
                  type="text"
                  value={newEntry}
                  onChange={e => setNewEntry(e.target.value)}
                  onSubmit={() => console.log("submit")}
                  onKeyUp={e => e.key === "Escape" && setNewEntry(undefined)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800" />
                <button className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg ml-2">
                  <FaPlus />
                </button>
                <button
                  onClick={() => setNewEntry(undefined)}
                  className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg ml-2">
                  <FaDeleteLeft />
                </button>
              </form>
            </div>
          )}
          <div>
            {entries
              .filter(e => selected.indexOf(e.category ?? "root") > -1)
              .filter(e => (e.status & statusFilter) === 0)
              .filter(e => e.label && e.label.toLowerCase().indexOf(textFilter.toLowerCase()) > -1)
              .sort((a, b) => {
                if (a.status !== b.status) return a.status - b.status
                return DateTime.fromISO(a.modified_at).toMillis() - DateTime.fromISO(b.modified_at).toMillis()
              })
              .map((entry) => {
                const color = entry.status === Status.New ? "text-blue-600" : entry.status === Status.Urgent ? "text-red-600" : entry.status === Status.Waiting ? "text-slate-800 dark:text-slate-400" : "text-green-600"

                return (
                  <div
                    key={entry.id}
                    className={`
                    ${entrySelected === entry.id ? "bg-slate-50 sm:bg-transparent dark:bg-transparent dark:bg-slate-800 border-blue-300 dark:border-blue-800 p-2 sm:p-0" : "border-transparent"} sm:hover:p-1 border-4 sm:border-none transition-all ease-in-out
                    rounded-lg cursor-pointer text-lg sm:p-0
                      ${deletePending === entry.id ? "bg-red-600 text-slate-50 hover:bg-red-500" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    {deletePending === entry.id ?
                      <div ref={ref} className="flex grow font-semibold" onClick={() => deleteEntry(entry.id)}>
                        <button className="grow p-3 sm:p-0">Delete?</button>
                      </div>
                      :
                      <div>
                        <div className="group flex justify-between">
                          <div
                            onClick={() => entrySelected === entry.id ? setEntrySelected(undefined) : setEntrySelected(entry.id)}
                            className={`flex grow items-center font-semibold overflow-hidden ${color} selection:bg-inherit`}>
                            <div className="mr-2"><StatusIcon status={entry.status} /></div>
                            <div className="w-auto truncate">{entry.label}</div>
                            <div className="ml-2 grow text-md text-slate-500 dark:text-slate-50 opacity-20 truncate">
                              {categories.find(c => c.id === entry.category)?.label}
                            </div>
                          </div>
                          <div className={`hidden sm:group-hover:flex text-nowrap whitespace-nowrap items-center`}>
                            <Actions entry={entry} updateEntry={updateEntry} setDeletePending={setDeletePending} />
                          </div>
                          <span
                            className={`sm:group-hover:hidden ${entrySelected === entry.id ? "hidden sm:block" : ""} text-slate-500 dark:text-slate-50 opacity-50 text-nowrap ml-5`}>
                            {DateTime
                              .fromISO(entry.modified_at)
                              .toRelative()
                              ?.split(" ")
                              .map((word, i) => i === 0 ? word : i === 1 && word[0])}
                          </span>
                        </div>
                        <div className={`flex transition-all ease-in-out overflow-clip ${entrySelected === entry.id ? "sm:hidden h-13 p-3" : "h-0 p-0"} justify-evenly`}>
                          <Actions entry={entry} updateEntry={updateEntry} setDeletePending={setDeletePending} />
                        </div>
                      </div>
                    }
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div >
  );
}
