import api from '../../api/axios'
import type { Style } from '../../types'

export const stylesApi = {
  async getAll(): Promise<Style[]> {
    const res = await api.get('/api/styles')
    return res.data
  },

  async create(payload: Partial<Style>): Promise<Style> {
    try {
      const res = await api.post('/api/styles', payload);
      return res.data;
    } catch (error: any) {
      // Si el backend envía un mensaje, propágalo
      const backendMsg = error?.response?.data?.message;
      if (backendMsg) {
        throw new Error(backendMsg);
      }
      throw error;
    }
  },

  async update(id: string, payload: Partial<Style>): Promise<Style> {
    try {
      const res = await api.put(`/api/styles/${id}`, payload);
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },
  
  async remove(id: string): Promise<void> {
    await api.delete(`/api/styles/${id}`)
  }
}

export default stylesApi
