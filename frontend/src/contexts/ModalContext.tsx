import React, { createContext, useContext, useCallback, useState } from 'react'

type ModalContextValue = {
  isRecipeModalOpen: boolean
  recipeId: string | null
  openRecipeModal: (id?: string | null) => void
  closeRecipeModal: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)
  const [recipeId, setRecipeId] = useState<string | null>(null)

  const openRecipeModal = useCallback((id: string | null = null) => {
    setRecipeId(id)
    setIsRecipeModalOpen(true)
  }, [])

  const closeRecipeModal = useCallback(() => {
    setIsRecipeModalOpen(false)
    setRecipeId(null)
  }, [])

  const value: ModalContextValue = { isRecipeModalOpen, recipeId, openRecipeModal, closeRecipeModal }

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}

export default ModalContext
