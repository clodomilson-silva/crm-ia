'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Client, Task, Interaction } from '@/types/crm'

// Tipos para o estado global
interface CRMState {
  clients: Client[]
  tasks: Task[]
  interactions: Interaction[]
  stats: {
    totalClients: number
    prospects: number
    leads: number
    customers: number
    pendingTasks: number
    avgLeadScore: number
  }
  loading: {
    clients: boolean
    tasks: boolean
    interactions: boolean
  }
  filters: {
    clientSearch: string
    clientType: string
    clientStatus: string
    taskStatus: string
    taskPriority: string
  }
}

// Tipos para as ações
type CRMAction =
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; client: Partial<Client> } }
  | { type: 'REMOVE_CLIENT'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; task: Partial<Task> } }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'SET_INTERACTIONS'; payload: Interaction[] }
  | { type: 'ADD_INTERACTION'; payload: Interaction }
  | { type: 'SET_LOADING'; payload: { key: keyof CRMState['loading']; value: boolean } }
  | { type: 'SET_FILTER'; payload: { key: keyof CRMState['filters']; value: string } }
  | { type: 'CALCULATE_STATS' }

// Estado inicial
const initialState: CRMState = {
  clients: [],
  tasks: [],
  interactions: [],
  stats: {
    totalClients: 0,
    prospects: 0,
    leads: 0,
    customers: 0,
    pendingTasks: 0,
    avgLeadScore: 0,
  },
  loading: {
    clients: false,
    tasks: false,
    interactions: false,
  },
  filters: {
    clientSearch: '',
    clientType: '',
    clientStatus: '',
    taskStatus: '',
    taskPriority: '',
  },
}

// Reducer para gerenciar o estado
function crmReducer(state: CRMState, action: CRMAction): CRMState {
  switch (action.type) {
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload }

    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] }

    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id 
            ? { ...client, ...action.payload.client }
            : client
        ),
      }

    case 'REMOVE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
        tasks: state.tasks.filter(task => task.clientId !== action.payload),
        interactions: state.interactions.filter(interaction => interaction.clientId !== action.payload),
      }

    case 'SET_TASKS':
      return { ...state, tasks: action.payload }

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id 
            ? { ...task, ...action.payload.task }
            : task
        ),
      }

    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      }

    case 'SET_INTERACTIONS':
      return { ...state, interactions: action.payload }

    case 'ADD_INTERACTION':
      return { ...state, interactions: [...state.interactions, action.payload] }

    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      }

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value },
      }

    case 'CALCULATE_STATS':
      const totalClients = state.clients.length
      const prospects = state.clients.filter(c => c.clientType === 'prospect').length
      const leads = state.clients.filter(c => c.clientType === 'lead').length
      const customers = state.clients.filter(c => c.clientType === 'customer').length
      const pendingTasks = state.tasks.filter(t => t.status === 'pending').length
      const avgLeadScore = totalClients > 0 
        ? Math.round(state.clients.reduce((sum, c) => sum + c.leadScore, 0) / totalClients)
        : 0

      return {
        ...state,
        stats: {
          totalClients,
          prospects,
          leads,
          customers,
          pendingTasks,
          avgLeadScore,
        },
      }

    default:
      return state
  }
}

// Context
interface CRMContextType {
  state: CRMState
  dispatch: React.Dispatch<CRMAction>
  actions: {
    // Clients
    setClients: (clients: Client[]) => void
    addClient: (client: Client) => void
    updateClient: (id: string, client: Partial<Client>) => void
    removeClient: (id: string) => void
    // Tasks
    setTasks: (tasks: Task[]) => void
    addTask: (task: Task) => void
    updateTask: (id: string, task: Partial<Task>) => void
    removeTask: (id: string) => void
    // Interactions
    setInteractions: (interactions: Interaction[]) => void
    addInteraction: (interaction: Interaction) => void
    // Loading
    setLoading: (key: keyof CRMState['loading'], value: boolean) => void
    // Filters
    setFilter: (key: keyof CRMState['filters'], value: string) => void
    // Stats
    calculateStats: () => void
  }
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

// Provider
interface CRMProviderProps {
  children: ReactNode
}

export function CRMProvider({ children }: CRMProviderProps) {
  const [state, dispatch] = useReducer(crmReducer, initialState)

  // Actions helper functions
  const actions = {
    // Clients
    setClients: (clients: Client[]) => dispatch({ type: 'SET_CLIENTS', payload: clients }),
    addClient: (client: Client) => dispatch({ type: 'ADD_CLIENT', payload: client }),
    updateClient: (id: string, client: Partial<Client>) => dispatch({ type: 'UPDATE_CLIENT', payload: { id, client } }),
    removeClient: (id: string) => dispatch({ type: 'REMOVE_CLIENT', payload: id }),
    
    // Tasks
    setTasks: (tasks: Task[]) => dispatch({ type: 'SET_TASKS', payload: tasks }),
    addTask: (task: Task) => dispatch({ type: 'ADD_TASK', payload: task }),
    updateTask: (id: string, task: Partial<Task>) => dispatch({ type: 'UPDATE_TASK', payload: { id, task } }),
    removeTask: (id: string) => dispatch({ type: 'REMOVE_TASK', payload: id }),
    
    // Interactions
    setInteractions: (interactions: Interaction[]) => dispatch({ type: 'SET_INTERACTIONS', payload: interactions }),
    addInteraction: (interaction: Interaction) => dispatch({ type: 'ADD_INTERACTION', payload: interaction }),
    
    // Loading
    setLoading: (key: keyof CRMState['loading'], value: boolean) => dispatch({ type: 'SET_LOADING', payload: { key, value } }),
    
    // Filters
    setFilter: (key: keyof CRMState['filters'], value: string) => dispatch({ type: 'SET_FILTER', payload: { key, value } }),
    
    // Stats
    calculateStats: () => dispatch({ type: 'CALCULATE_STATS' }),
  }

  // Auto-calculate stats when clients or tasks change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_STATS' })
  }, [state.clients, state.tasks])

  return (
    <CRMContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </CRMContext.Provider>
  )
}

// Hook para usar o context
export function useCRM() {
  const context = useContext(CRMContext)
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider')
  }
  return context
}

// Hook para filtros específicos
export function useFilters() {
  const { state, actions } = useCRM()
  return {
    filters: state.filters,
    setFilter: actions.setFilter,
  }
}

// Hook para estatísticas
export function useStats() {
  const { state } = useCRM()
  return state.stats
}
