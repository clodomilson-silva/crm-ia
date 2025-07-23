'use client'

import { SWRConfig } from 'swr'
import axios from 'axios'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

export default function SWRProvider({ children }: SWRProviderProps) {
  const swrConfig = {
    fetcher: (url: string) => axios.get(url).then(res => res.data),
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    dedupingInterval: 2000,
  }

  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  )
}
