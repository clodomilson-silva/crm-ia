import { Client, Interaction, Task } from '@prisma/client'

export type { Client, Interaction, Task } from '@prisma/client'

export type ClientWithRelations = Client & {
  interactions: Interaction[]
  tasks: Task[]
}

export interface CreateClientData {
  name: string
  email: string
  phone?: string
  clientType: 'prospect' | 'lead' | 'customer' | 'inactive'
  notes?: string
}

export interface UpdateClientData {
  name?: string
  email?: string
  phone?: string
  clientType?: 'prospect' | 'lead' | 'customer' | 'inactive'
  notes?: string
  leadScore?: number
  status?: 'active' | 'inactive'
}

export interface CreateInteractionData {
  clientId: string
  type: 'email' | 'call' | 'whatsapp' | 'meeting'
  content: string
  aiGenerated?: boolean
}

export interface CreateTaskData {
  clientId: string
  title: string
  description?: string
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'follow-up'
  priority?: 'low' | 'medium' | 'high'
  dueDate?: Date
  aiSuggested?: boolean
}

export interface AIAnalysis {
  leadScore: number
  nextAction: string
  actionPriority: 'low' | 'medium' | 'high'
  reasoning: string
}

export interface ClientSearchData {
  id: string
  name: string
  email: string
  clientType: string
  notes?: string | null
}
