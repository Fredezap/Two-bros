import { create } from 'zustand';

interface ModalState {
  showModal: boolean;
  recipeId: string | null;
  setShowModal: (show: boolean) => void;
  setRecipeId: (id: string | null) => void;
}

const useModalStore = create<ModalState>((set) => ({
  showModal: false,
  recipeId: null,
  setShowModal: (show) => set({ showModal: show }),
  setRecipeId: (id) => set({ recipeId: id }),
}));

export default useModalStore;
