import api from '../../api/axios'
import type { Recipe } from '../../types'

export const recipesApi = {
  async getAll(): Promise<Recipe[]> {
    const res = await api.get('/api/recipes')
    return res.data
  },
  async getById(id: string): Promise<Recipe> {
    const res = await api.get(`/api/recipes/${id}`)
    return res.data
  },
  async create(payload: Partial<Recipe>): Promise<Recipe> {
    const res = await api.post('/api/recipes', payload)
    return res.data
  },
  async update(id: string, payload: Partial<Recipe>): Promise<Recipe> {
    const res = await api.put(`/api/recipes/${id}`, payload)
    return res.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/api/recipes/${id}`)
  }
}

export default recipesApi
