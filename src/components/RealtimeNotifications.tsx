'use client'

import { useWebSocket } from '@/hooks/useWebSocket'
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export default function RealtimeNotifications() {
  const { 
    notifications, 
    removeNotification,
    clearNotifications 
  } = useWebSocket()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800'
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800'
    }
  }

  return (
    <>
      {/* Notifications Container */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {/* Clear All Button */}
          {notifications.length > 1 && (
            <div className="flex justify-end">
              <button
                onClick={clearNotifications}
                className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded border shadow-sm"
              >
                Limpar todas
              </button>
            </div>
          )}

          {/* Notifications List */}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-4 rounded-lg border shadow-sm transition-all transform animate-in slide-in-from-right-5 ${getNotificationStyles(notification.type)}`}
            >
              <div className="flex-shrink-0 mr-3">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
