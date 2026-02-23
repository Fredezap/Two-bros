import api from '../../api/axios'
import type { Ingredient } from '../../types'

export const ingredientsApi = {
  async getAll(): Promise<Ingredient[]> {
    const res = await api.get('/api/ingredients')
    return res.data
  },
  async create(payload: Partial<Ingredient>): Promise<Ingredient> {
    const res = await api.post('/api/ingredients', payload)
    return res.data
  },
  async update(id: string, payload: Partial<Ingredient>): Promise<Ingredient> {
    const res = await api.put(`/api/ingredients/${id}`, payload)
    return res.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/api/ingredients/${id}`)
  }
}

export default ingredientsApi
