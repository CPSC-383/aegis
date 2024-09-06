// https://bobbyhadz.com/blog/react-functional-component-add-event-listener

import { useEffect } from 'react'

export enum EventType {
    RENDER = 'render',
    RENDER_MAP = 'render_map',
    RENDER_STACK = 'render_stack',
    TILE_CLICK = 'tile_click',
    RIGHT_CLICK = 'right_click'
}

export function dispatchEvent(eventType: string, eventData: any) {
    const event = new CustomEvent(eventType, { detail: eventData })
    document.dispatchEvent(event)
}

export function listenEvent(eventType: string, callback: (eventData: any) => void, dependencies?: any[]) {
    useEffect(() => {
        document.addEventListener(eventType, callback)
        return () => {
            document.removeEventListener(eventType, callback)
        }
    }, dependencies)
}
