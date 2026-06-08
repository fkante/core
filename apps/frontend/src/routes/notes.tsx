import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import type { Note } from 'core'
import { useState } from 'react'

import { ApiError, apiFetch } from '../lib/api'
import { getCurrentUserFn } from '../server/auth'

/**
 * EXAMPLE protected route. `beforeLoad` gates on the server (SSR-safe, no
 * protected HTML leaks), then the component lists the user's notes with React
 * Query and creates new ones through `apiFetch`. Delete with the rest of the
 * notes example.
 */
export const Route = createFileRoute('/notes')({
  component: NotesScreen,
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn()
    if (!user) {
      throw redirect({ to: '/auth', search: { redirect: location.href } })
    }
    return { user }
  },
})

interface NotesResponse {
  notes: Note[]
}

interface CreateNoteResponse {
  note: Note
}

function NotesScreen() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const notesQuery = useQuery({
    queryKey: ['notes'],
    queryFn: () => apiFetch<NotesResponse>('/api/notes'),
  })

  const createNote = useMutation({
    mutationFn: (input: { title: string; body: string }) =>
      apiFetch<CreateNoteResponse>('/api/notes', { method: 'POST', body: input }),
    onSuccess: () => {
      setTitle('')
      setBody('')
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    createNote.mutate({ title: title.trim(), body: body.trim() })
  }

  const createError =
    createNote.error instanceof ApiError
      ? createNote.error.code === 'rate_limited'
        ? 'You are creating notes too quickly. Try again later.'
        : 'Could not save the note. Please try again.'
      : null

  const notes = notesQuery.data?.notes ?? []

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Notes</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        An example protected feature. This page is gated server-side and only shows your own notes.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          maxLength={200}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write something…"
          rows={3}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
        />
        {createError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {createError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={createNote.isPending || !title.trim()}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {createNote.isPending ? 'Saving…' : 'Add note'}
        </button>
      </form>

      <section className="mt-8 flex flex-col gap-3">
        {notesQuery.isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No notes yet. Add your first one above.
          </p>
        ) : (
          notes.map((note) => (
            <article
              key={note.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="font-semibold text-zinc-900 dark:text-white">{note.title}</h2>
              {note.body ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {note.body}
                </p>
              ) : null}
              <time className="mt-2 block text-xs text-zinc-400 dark:text-zinc-500">
                {new Date(note.createdAt).toLocaleString()}
              </time>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
