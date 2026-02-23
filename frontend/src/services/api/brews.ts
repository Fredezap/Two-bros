import api from '../../api/axios'
import type { Brew } from '../../types'

export const brewsApi = {
  async getAll(): Promise<Brew[]> {
    const res = await api.get('/api/brews')
    return res.data
  },
  async create(payload: Partial<Brew>): Promise<Brew> {
    const res = await api.post('/api/brews', payload)
    return res.data
  },
  async update(id: string, payload: Partial<Brew>): Promise<Brew> {
    const res = await api.put(`/api/brews/${id}`, payload)
    return res.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/api/brews/${id}`)
  },
  async cancel(id: string): Promise<any> {
    const res = await api.post(`/api/brews/${id}/cancel`)
    return res.data
  },
    async patch(id: string, payload: Partial<Brew>): Promise<Brew> {
    const res = await api.patch(`/api/brews/${id}`, payload)
    return res.data
  },
}

export default brewsApi
