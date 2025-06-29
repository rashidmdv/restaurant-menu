// File: web/src/features/interactions/components/interactions-dialogs.tsx

import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useInteractions } from '../context/interactions-context'
import { InteractionsImportDialog } from './interactions-import-dialog'
import { InteractionsDetailsDialog } from './interactions-details-dialog'
import { InteractionsReplyDialog } from './interactions-reply-dialog'

export function InteractionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useInteractions()
  return (
    <>
      <InteractionsImportDialog
        key='interactions-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <InteractionsDetailsDialog
            key={`interaction-details-${currentRow.id}`}
            open={open === 'details'}
            onOpenChange={() => {
              setOpen('details')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <InteractionsReplyDialog
            key={`interaction-reply-${currentRow.id}`}
            open={open === 'reply'}
            onOpenChange={() => {
              setOpen('reply')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='interaction-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'The following interaction has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete Interaction ${currentRow.id}?`}
            desc={
              <>
                You are about to delete an interaction from <strong>{currentRow.customerName}</strong>. <br />
                This action cannot be undone and will remove the entire conversation history.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}