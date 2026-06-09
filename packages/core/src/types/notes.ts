/**
 * EXAMPLE shared type — the wire shape of a note as returned by the backend
 * `/api/notes` endpoints (timestamps are ISO strings over JSON). Lives in `core`
 * so the frontend and backend agree on the contract. Delete with the rest of the
 * notes example.
 */
export interface Note {
  id: string
  userId: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}
