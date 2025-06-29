import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Interaction } from '../data/schema'

type InteractionsDialogType = 'create' | 'update' | 'delete' | 'import' | 'details' | 'reply'

interface InteractionsContextType {
  open: InteractionsDialogType | null
  setOpen: (str: InteractionsDialogType | null) => void
  currentRow: Interaction | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Interaction | null>>
}

const InteractionsContext = React.createContext<InteractionsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function InteractionsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<InteractionsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Interaction | null>(null)
  return (
    <InteractionsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </InteractionsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useInteractions = () => {
  const interactionsContext = React.useContext(InteractionsContext)

  if (!interactionsContext) {
    throw new Error('useInteractions has to be used within <InteractionsContext>')
  }

  return interactionsContext
}