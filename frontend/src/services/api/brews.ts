import api from '../../api/axios'
import type { Brew } from '../../types'
import { API_ROUTES } from '../../stores/routes'

export const brewsApi = {
  async getAll(): Promise<Brew[]> {
    const res = await api.get(API_ROUTES.BREWS)
    return res.data
  },
  async create(payload: Partial<Brew>): Promise<Brew> {
    const res = await api.post(API_ROUTES.BREWS, payload)
    return res.data
  },
  async update(id: string, payload: Partial<Brew>): Promise<Brew> {
    const res = await api.put(`${API_ROUTES.BREWS}/${id}`, payload)
    return res.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`${API_ROUTES.BREWS}/${id}`)
  },
  async cancel(id: string): Promise<any> {
    const res = await api.post(`${API_ROUTES.BREWS}/${id}/cancel`)
    return res.data
  },
  async patch(id: string, payload: Partial<Brew>): Promise<Brew> {
    const res = await api.patch(`${API_ROUTES.BREWS}/${id}`, payload)
    return res.data
  },
}

export default brewsApi
