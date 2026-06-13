import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

export interface SessionData {
  stage: number
  username: string | null
}

export const auth = {
  login: (username: string, password: string) =>
    api.post<{ stage: number; username: string }>('/auth/login', { username, password }),

  mnemonic: (phrase: string) =>
    api.post<{ stage: number; username: string }>('/auth/mnemonic', { phrase }),

  session: () =>
    api.get<SessionData>('/auth/session'),

  logout: () =>
    api.post('/auth/logout'),
}
