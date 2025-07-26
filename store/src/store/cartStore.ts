import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  isOpen: boolean;
  itemCount: number;
  setIsOpen: (isOpen: boolean) => void;
  setItemCount: (count: number) => void;
  incrementItemCount: () => void;
  decrementItemCount: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      isOpen: false,
      itemCount: 0,
      setIsOpen: (isOpen) => set({ isOpen }),
      setItemCount: (count) => set({ itemCount: count }),
      incrementItemCount: () => set((state) => ({ itemCount: state.itemCount + 1 })),
      decrementItemCount: () => set((state) => ({ itemCount: Math.max(0, state.itemCount - 1) })),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ itemCount: state.itemCount }),
    }
  )
); 