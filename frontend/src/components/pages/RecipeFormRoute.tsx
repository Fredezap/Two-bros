import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import RecipeFormModal from '../RecipeFormModal'
import { useModal } from '../../contexts/ModalContext'

export const RecipeFormRoute: React.FC = () => {
  const { id } = useParams()
  const { openRecipeModal, closeRecipeModal } = useModal()

  useEffect(() => {
    openRecipeModal(id || null)
    return () => closeRecipeModal()
  }, [id, openRecipeModal, closeRecipeModal])

  return <RecipeFormModal />
}

export default RecipeFormRoute
