import React, { createContext, useContext, useState, useCallback } from 'react'

type EventHandler = (data: any) => void
type EventMap = { [eventName: string]: EventHandler[] }

const EventBusContext = createContext<{
    emit: (name: string, data: any) => void
    on: (name: string, handler: EventHandler) => void
    off: (name: string, handler: EventHandler) => void
} | null>(null)

export const EventBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<EventMap>({})

    const emit = useCallback((name: string, data: any) => {
        const handlers = events[name]
        if (handlers) {
            handlers.forEach((handler) => handler(data))
        }
    }, [events])

    const on = useCallback((name: string, handler: EventHandler) => {
        setEvents((prev) => {
            const handlers = prev[name] || []
            return {
                ...prev,
                [name]: [...handlers, handler],
            }
        })
    }, [])

    const off = useCallback((name: string, handler: EventHandler) => {
        setEvents((prev) => {
            const handlers = prev[name]?.filter((h) => h !== handler) || []
            return {
                ...prev,
                [name]: handlers,
            }
        })
    }, [])

    return (
        <EventBusContext.Provider value={{ emit, on, off }}>
            {children}
        </EventBusContext.Provider>
    )
}

export const useEventBus = () => {
    const context = useContext(EventBusContext)
    if (!context) {
        throw new Error('useEventBus must be used within an EventBusProvider')
    }
    return context
}
