// File: web/src/features/interactions/components/columns.tsx

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { channels, getIntentColor, getSentimentColor, getSentimentFromScore, intents, statuses } from '../data/data'
import { Interaction } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BotIcon } from 'lucide-react'

export const columns: ColumnDef<Interaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[80px] font-medium'>{row.getValue('id')}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('customerName')}</span>
          <span className='text-xs text-muted-foreground'>{row.original.customerPhone}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'message',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Message' />
    ),
    cell: ({ row }) => {
      return (
        <div className='max-w-[300px] truncate' title={row.getValue('message')}>
          {row.getValue('message')}
        </div>
      )
    },
  },
  {
    accessorKey: 'intent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Intent' />
    ),
    cell: ({ row }) => {
      const intent = intents.find(
        (intent) => intent.value === row.getValue('intent')
      )

      if (!intent) {
        return null
      }

      return (
        <div className='flex items-center'>
          <Badge className={getIntentColor(row.getValue('intent'))}>
            {intent.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('timestamp'))
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      
      return (
        <div className='flex flex-col'>
          <span>{isToday ? format(date, 'hh:mm a') : format(date, 'MMM dd')}</span>
          <span className='text-xs text-muted-foreground'>
            {isToday ? format(date, 'EEE') : format(date, 'hh:mm a')}
          </span>
        </div>
      )
    },
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status.icon && (
            <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'channel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Channel' />
    ),
    cell: ({ row }) => {
      const channel = channels.find(
        (channel) => channel.value === row.getValue('channel')
      )

      if (!channel) {
        return null
      }

      return (
        <div className='flex items-center'>
          {channel.icon && (
            <channel.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{channel.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'sentimentScore',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sentiment' />
    ),
    cell: ({ row }) => {
      const score = row.getValue('sentimentScore') as number
      if (score === undefined) return null
      
      const sentiment = getSentimentFromScore(score)
      
      return (
        <Badge className={getSentimentColor(sentiment)}>
          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'assignedTo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned To' />
    ),
    cell: ({ row }) => {
      const assignedTo = row.getValue('assignedTo') as string
      const isAI = assignedTo?.includes('AI')
      
      if (!assignedTo) return <span className="text-muted-foreground">Unassigned</span>
      
      return (
        <div className='flex items-center'>
          {isAI ? (
            <BotIcon className='mr-2 h-4 w-4 text-muted-foreground' />
          ) : (
            <Avatar className='h-6 w-6 mr-2'>
              <AvatarFallback className='text-xs'>
                {assignedTo.split(' ')[0]?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
          )}
          <span>{assignedTo}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]