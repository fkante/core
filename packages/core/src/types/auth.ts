export type Role = 'user' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}
