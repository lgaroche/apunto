"use client";
import { useApuntoContext } from "@/providers/ApuntoProvider";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { FaPlus } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { Categories } from "./categories";
import { useCategoryFilterContext } from "@/providers/CategoryFilter";
import { useRouter } from "next/navigation";

enum Status {
  New = 1,
  Waiting = 2,
  Urgent = 4,
  Done = 8
}

export default function Home() {
  const { entries, categories, addEntry, updateEntry, deleteEntry } = useApuntoContext()
  const { selected } = useCategoryFilterContext()

  const [statusFilter, setStatusFilter] = useState<number>(0)
  const [textFilter, setTextFilter] = useState<string>("")
  const [newEntry, setNewEntry] = useState<string | undefined>()
  const [deletePending, setDeletePending] = useState<string | undefined>()

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
    <div className="m-auto flex max-w-screen-xl">
      <div className="p-5 basis-1/3 max-w-96 hidden sm:block">
        <Categories />
      </div>
      <div className="p-5 basis-2/3">
        <div className="flex mb-5 flex-col sm:flex-row">
          <div className="flex mb-2">
            <button
              onClick={() => setNewEntry("")}
              className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mr-2">
              <FaPlus />
            </button>

            {[Status.New, Status.Waiting, Status.Urgent, Status.Done].map(status => {
              return (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`bg-slate-50 dark:bg-slate-800 ${(statusFilter & status) > 0 ? "opacity-25" : ""} p-2 rounded-lg mr-2`}>
                  {toEmoji(status)}
                </button>
              )
            })}
          </div>
          <input
            value={textFilter}
            onChange={e => setTextFilter(e.target.value)}
            type="text"
            placeholder="Filter"
            className="w-full mb-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800" />
        </div>
        <div className="flex flex-col">
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
              .map((entry) => {
                const color = entry.status === Status.New ? "text-blue-600" : entry.status === Status.Urgent ? "text-red-600" : entry.status === Status.Waiting ? "text-slate-800 dark:text-slate-300" : "text-green-600"

                return (
                  <div
                    key={entry.id}
                    className={`
                      group flex justify-between rounded-lg cursor-pointer
                      ${deletePending === entry.id ? "bg-red-600 text-slate-50 hover:bg-red-500" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    {deletePending === entry.id ?
                      <div ref={ref} className="flex grow font-semibold" onClick={() => deleteEntry(entry.id)}>
                        <button className="grow">Delete?</button>
                      </div>
                      :
                      <>
                        <div
                          onDoubleClick={() => router.push(`/entry/${entry.id}`)}
                          className={`flex grow font-semibold overflow-hidden ${color} selection:bg-inherit`}>
                          <div className="mr-2">{toEmoji(entry.status)}</div>
                          <div className="w-auto text-nowrap text-ellipsis overflow-hidden">{entry.label}</div>
                          <div className="ml-2 text-slate-500 dark:text-slate-50 opacity-20 text-nowrap">
                            {categories.find(c => c.id === entry.category)?.label}
                          </div>
                        </div>
                        <div className="hidden group-hover:inline text-nowrap">
                          <Link
                            href={`/entry/${entry.id}`}
                            className="mr-4">
                            💬
                          </Link>
                          {[Status.New, Status.Waiting, Status.Urgent, Status.Done].map(status => {
                            return (
                              <button
                                key={status}
                                disabled={status.valueOf() === entry.status}
                                onClick={() => updateEntry({ id: entry.id, modified_at: (new Date).toISOString(), status })}
                                className={`bg-slate-50 dark:bg-slate-800 ${status.valueOf() === entry.status ? "opacity-25" : ""} mr-2`}>
                                {toEmoji(status)}
                              </button>
                            )
                          })
                          }
                          <button
                            className="mr-2"
                            onClick={() => setDeletePending(entry.id)}>
                            ❌
                          </button>
                        </div>
                        <span
                          className="text-slate-500 dark:text-slate-50 opacity-50 text-nowrap ml-5">
                          {DateTime
                            .fromISO(entry.modified_at)
                            .toRelative()
                            ?.split(" ")
                            .map((word, i) => i === 0 ? word : i === 1 && word[0])}
                        </span>
                      </>}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
