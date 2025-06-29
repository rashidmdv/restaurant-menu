import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { getIntentColor, intents } from '../data/data'
import { Interaction } from '../data/schema'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  IconBrandWhatsapp, 
  IconMessageDots, 
  IconRobot, 
  IconSend, 
  IconTemplate, 
  IconUser 
} from '@tabler/icons-react'

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  responseType: z.enum(['template', 'custom']),
  template: z.string().optional(),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Interaction
}

export function InteractionsReplyDialog({ open, onOpenChange, currentRow }: Props) {
  const [useAI, setUseAI] = useState(true)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      responseType: 'custom',
      template: '',
    },
  })

  const responseType = form.watch('responseType')
  const intent = intents.find(i => i.value === currentRow.intent)

  // Template responses based on intent
  const templates = {
    add_to_cart: [
      "Thank you for your interest! I've added those items to your cart. Would you like to complete your purchase now?",
      "Your items have been added to cart. Would you like to continue shopping or proceed to checkout?",
    ],
    order_status: [
      "Your order #ORDER_ID is currently in processing stage and will be shipped within 24 hours.",
      "I've checked your order status. It's currently being prepared and will be shipped soon.",
    ],
    product_query: [
      "Yes, we do have that item in stock! Would you like me to send you more details about it?",
      "Thank you for your inquiry. That product is available in various colors and sizes. Can I help you select one?",
    ],
    cancel_order: [
      "I understand you want to cancel your order. I've processed your cancellation request and you'll receive a confirmation soon.",
      "Your order cancellation has been processed. Would you like to place a new order or browse our latest products?",
    ],
    complaint: [
      "I'm sorry to hear about your experience. We take this feedback seriously and will address this issue immediately.",
      "I apologize for the inconvenience. I've escalated this to our customer service team who will contact you shortly.",
    ],
  }

  const getTemplates = () => {
    return (templates as any)[currentRow.intent] || [
      "Thank you for reaching out! How can I assist you today?",
      "I appreciate your message. Is there anything specific you'd like help with?",
    ]
  }

  const selectTemplate = (template: string) => {
    form.setValue('template', template)
    form.setValue('message', template)
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const response = {
      ...data,
      customerId: currentRow.customerPhone,
      customerName: currentRow.customerName,
      channel: currentRow.channel,
      interactionId: currentRow.id,
      sentBy: useAI ? 'AI Bot' : 'Agent',
      timestamp: new Date().toISOString(),
    }
    
    showSubmittedData(response, 'Message sent:')
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) form.reset()
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBrandWhatsapp className="h-5 w-5 text-green-600" />
              <span>Reply to {currentRow.customerName}</span>
            </div>
            {intent && (
              <Badge className={getIntentColor(currentRow.intent)}>
                {intent.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Card className="p-3 bg-muted/50 text-sm">
            <p className="font-medium mb-1">Original Message:</p>
            <p>{currentRow.message}</p>
          </Card>
        </div>

        <Tabs defaultValue="reply" className="w-full">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="reply" className="flex items-center gap-1">
              <IconMessageDots className="h-4 w-4" /> Reply
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-1">
              <IconTemplate className="h-4 w-4" /> Options
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reply">
            <Form {...form}>
              <form
                id="interaction-reply-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="responseType"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Response Type</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select response type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom Message</SelectItem>
                            <SelectItem value="template">Template Response</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {responseType === 'template' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select a template:</p>
                    <div className="grid gap-2">
                      {getTemplates().map((template: string, index: number) => (
                        <Card 
                          key={index} 
                          className="p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => selectTemplate(template)}
                        >
                          <p className="text-sm">{template}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Type your reply here..."
                          className="min-h-24 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="options">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Response Mode</p>
                <div className="flex gap-2">
                  <Button
                    variant={useAI ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseAI(true)}
                    className="flex items-center gap-1"
                  >
                    <IconRobot className="h-4 w-4" />
                    <span>AI Assistant</span>
                  </Button>
                  <Button
                    variant={!useAI ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseAI(false)}
                    className="flex items-center gap-1"
                  >
                    <IconUser className="h-4 w-4" />
                    <span>Human Agent</span>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Message Type</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Text
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Image
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Document
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    Set as Resolved
                  </Button>
                  <Button variant="outline" size="sm">
                    Transfer to Agent
                  </Button>
                  <Button variant="outline" size="sm">
                    Add to CRM
                  </Button>
                  <Button variant="outline" size="sm">
                    Create Ticket
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="submit" 
            form="interaction-reply-form"
            className="flex items-center gap-1"
          >
            <IconSend className="h-4 w-4" />
            Send Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}