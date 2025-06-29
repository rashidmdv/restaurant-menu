// File: web/src/features/interactions/components/interactions-details-dialog.tsx

import { format } from 'date-fns'
import { 
  IconUser,
  IconPhone,
  IconCalendar,
  IconBrandWhatsapp,
  IconTag,
  IconUserCheck,
  IconRobot,
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getIntentColor, getSentimentFromScore, getSentimentColor, intents } from '../data/data'
import { Interaction } from '../data/schema'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Interaction
}

export function InteractionsDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const intent = intents.find(i => i.value === currentRow.intent)
  const date = new Date(currentRow.timestamp)
  const sentiment = currentRow.sentimentScore !== undefined 
    ? getSentimentFromScore(currentRow.sentimentScore) 
    : 'neutral'
  
  // Mock conversation history
  const conversation = [
    {
      id: 1,
      sender: 'customer',
      message: currentRow.message,
      timestamp: currentRow.timestamp,
    },
    {
      id: 2,
      sender: 'agent',
      message: 'Thank you for your message. How can I help you today?',
      timestamp: new Date(date.getTime() + 2 * 60000).toISOString(), // 2 minutes later
      agent: currentRow.assignedTo || 'AI Bot',
    },
    {
      id: 3,
      sender: 'customer',
      message: 'I need more information about the product.',
      timestamp: new Date(date.getTime() + 5 * 60000).toISOString(), // 5 minutes later
    },
    {
      id: 4,
      sender: 'agent',
      message: 'Of course! Here are the specifications you requested. Let me know if you need anything else.',
      timestamp: new Date(date.getTime() + 8 * 60000).toISOString(), // 8 minutes later
      agent: currentRow.assignedTo || 'AI Bot',
    },
  ]

  // Get sentiment icon
  const SentimentIcon = () => {
    switch(sentiment) {
      case 'positive': return <IconMoodSmile className="h-4 w-4 text-green-500" />
      case 'negative': return <IconMoodSad className="h-4 w-4 text-red-500" />
      default: return <IconMoodNeutral className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Interaction {currentRow.id}</span>
            <Badge className={getIntentColor(currentRow.intent)}>
              {intent?.label || currentRow.intent}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <IconUser className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Customer:</span>
              <span className="ml-2">{currentRow.customerName}</span>
            </div>
            <div className="flex items-center">
              <IconPhone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Phone:</span>
              <span className="ml-2">{currentRow.customerPhone}</span>
            </div>
            <div className="flex items-center">
              <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{format(date, 'PPpp')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <IconBrandWhatsapp className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Channel:</span>
              <span className="ml-2">{currentRow.channel === 'whatsapp' ? 'WhatsApp' : currentRow.channel}</span>
            </div>
            <div className="flex items-center">
              <SentimentIcon />
              <span className="font-medium ml-2">Sentiment:</span>
              <Badge className={cn("ml-2", getSentimentColor(sentiment))}>
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <IconTag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Tags:</span>
              {currentRow.tags && currentRow.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1 ml-2">
                  {currentRow.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground ml-2">No tags</span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Conversation</h3>
            <div className="flex items-center">
              <span className="text-sm mr-2">Assigned to:</span>
              <div className="flex items-center">
                {currentRow.assignedTo?.includes('AI') ? (
                  <IconRobot className="h-4 w-4 mr-1 text-muted-foreground" />
                ) : (
                  <IconUserCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">
                  {currentRow.assignedTo || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {conversation.map((message) => (
              <Card 
                key={message.id} 
                className={cn(
                  "border",
                  message.sender === 'customer' ? "ml-0 mr-12" : "ml-12 mr-0",
                )}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {message.sender === 'customer' ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {currentRow.customerName.split(' ')[0]?.[0] || '?'}
                              {currentRow.customerName.split(' ')[1]?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <span>{currentRow.customerName}</span>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {message.agent?.includes('AI') ? 'AI' : message.agent?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{message.agent}</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.timestamp), 'hh:mm a')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <p>{message.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={() => onOpenChange(false)}>Reply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}