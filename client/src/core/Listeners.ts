export enum ListenerKey {
  Match = 'match',
  Round = 'round',
  Control = 'control',
  Canvas = 'canvas',
  Hover = 'hover'
}

type Listener = () => void

const listenersMap: Record<ListenerKey, Listener[]> = {
  [ListenerKey.Match]: [],
  [ListenerKey.Round]: [],
  [ListenerKey.Control]: [],
  [ListenerKey.Canvas]: [],
  [ListenerKey.Hover]: []
}

export function subscribe(key: ListenerKey, listener: Listener): () => void {
  if (!listenersMap[key]) listenersMap[key] = []
  listenersMap[key].push(listener)

  return () => {
    listenersMap[key] = listenersMap[key].filter((l) => l !== listener)
  }
}

export function notify(key: ListenerKey): void {
  listenersMap[key]?.forEach((listener) => listener())
}
