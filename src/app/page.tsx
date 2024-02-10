"use client";
import { useApuntoContext } from "@/providers/ApuntoProvider";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { useCallback, useEffect, useRef, useState } from "react";

enum Status {
  New = 1,
  Waiting = 2,
  Urgent = 4,
  Done = 8
}

export default function Home() {
  const { entries, addEntry, setStatus, deleteEntry } = useApuntoContext()
  const [statusFilter, setStatusFilter] = useState<number>(0)
  const [textFilter, setTextFilter] = useState<string>("")
  const [newEntry, setNewEntry] = useState<string | undefined>()
  const [deletePending, setDeletePending] = useState<number | undefined>()
  const ref = useRef<HTMLDivElement>(null);

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
      status: Status.New,
      label: newEntry
    })
    setNewEntry("")
  }, [addEntry, newEntry])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [handleClickOutside])

  const toEmoji = (status: Status) => {
    switch (status) {
      case Status.New:
        return "✏️"
      case Status.Waiting:
        return "📋"
      case Status.Urgent:
        return "⏰"
      case Status.Done:
        return "✅"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-row justify-center">

      <div className="p-5">
        <div className="flex mb-5">
          <button
            onClick={() => setNewEntry("")}
            className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mr-2">
            +
          </button>

          {[Status.New, Status.Waiting, Status.Urgent, Status.Done].map(status => {
            return (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`bg-slate-50 dark:bg-slate-800 text-slate-100${(statusFilter & status) > 0 && "/25"} p-2 rounded-lg mr-2`}>
                {toEmoji(status)}
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
        <div>
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
                <button className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg ml-2">+</button>
                <button
                  onClick={() => setNewEntry(undefined)}
                  className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg ml-2">
                  x
                </button>
              </form>
            </div>
          )}
          {entries
            .filter(e => (e.status & statusFilter) === 0)
            .filter(e => e.label && e.label.toLowerCase().indexOf(textFilter.toLowerCase()) > -1)
            .map((entry, index) => {
              const color = entry.status === Status.New ? "text-blue-600" : entry.status === Status.Urgent ? "text-red-600" : entry.status === Status.Waiting ? "text-slate-200 dark:text-slate-300" : "text-green-600"

              return (
                <div key={index} className={`group flex rounded-lg cursor-default pl-2 ${deletePending === entry.id ? "bg-red-600" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                  {deletePending === entry.id ?
                    <div ref={ref} className="flex grow font-semibold" onClick={() => deleteEntry(entry.id)}>
                      <button className="grow">Delete?</button>
                    </div>
                    :
                    <>
                      <div className={`grow font-semibold ${color}`}>
                        <span className="mr-2">
                          {toEmoji(entry.status)}
                        </span>
                        <span>{entry.label}</span>
                      </div>
                      <div className="invisible group-hover:visible">
                        {[Status.New, Status.Waiting, Status.Urgent, Status.Done].map(status => {
                          return (
                            <button
                              key={status}
                              onClick={() => setStatus(entry.id, status)}
                              className={`bg-slate-50 dark:bg-slate-800 text-slate-100${status === entry.status ? "/25" : ""} mr-2`}>
                              {toEmoji(status)}
                            </button>
                          )
                        })
                        }
                        <button onClick={() => setDeletePending(entry.id)}>❌</button>
                      </div>
                      <span className="text-slate-50/50">1m</span>
                    </>}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  );
}
