import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import NumberInput from './NumberInput'
import { Vector } from '@/types'
import Round from '@/core/Round'
import { Trash2, GripVertical } from 'lucide-react'

interface Props {
  tile: Vector | undefined
  round: Round | undefined
  onClose: () => void
}

export default function LayerEditor({ tile, round, onClose }: Props) {
  if (!tile || !round) return null

  const originalLayers = round.world.cellAt(tile.x, tile.y).layers
  const [layers, setLayers] = useState([...originalLayers])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleClose = () => {
    round.world.cellAt(tile.x, tile.y).layers = [...layers]
    onClose()
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = layers.findIndex((_, i) => `layer-${i}` === active.id)
      const newIndex = layers.findIndex((_, i) => `layer-${i}` === over.id)
      setLayers((items) => arrayMove(items, oldIndex, newIndex))
    }
  }

  const updateLayer = (index: number, updates: any) => {
    setLayers((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        object: {
          ...next[index].object,
          ...updates
        }
      }
      return next
    })
  }

  const deleteLayer = (index: number) => {
    setLayers((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={!!tile} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit Layers at ({tile.x}, {tile.y})
          </DialogTitle>
          <DialogDescription>
            Inspect, reorder, modify, or remove layers from this tile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[300px] overflow-y-auto overflow-x-hidden">
          {layers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No layers on this tile.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={layers.map((_, i) => `layer-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {layers.map((layer, index) => (
                  <SortableLayer
                    key={`layer-${index}`}
                    id={`layer-${index}`}
                    index={index}
                    layer={layer}
                    onDelete={() => deleteLayer(index)}
                    onUpdate={(updates) => updateLayer(index, updates)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SortableLayer({
  id,
  layer,
  index,
  onDelete,
  onUpdate
}: {
  id: string
  layer: any
  index: number
  onDelete: () => void
  onUpdate: (updates: any) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="border p-2 rounded text-sm bg-background"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div {...listeners} className="cursor-grab">
            <GripVertical className="w-4 h-4" />
          </div>
          <strong>Layer {index + 1}</strong>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      <div className="text-xs mt-1 text-muted-foreground">
        <div>Type: {layer.object.oneofKind}</div>

        {layer.object.oneofKind === 'survivor' && (
          <div className="mt-1 space-y-1">
            <label className="block">
              Health:
              <NumberInput
                name="health"
                value={layer.object.survivor.health}
                min={1}
                onChange={(_, value) =>
                  onUpdate({
                    survivor: {
                      ...layer.object.survivor,
                      health: value
                    }
                  })
                }
              />
            </label>
          </div>
        )}

        {layer.object.oneofKind === 'rubble' && (
          <div className="mt-1 space-y-1">
            <label className="block">
              Energy Required:
              <NumberInput
                name="energyRequired"
                value={layer.object.rubble?.energyRequired ?? 0}
                min={1}
                onChange={(_, value) =>
                  onUpdate({
                    rubble: {
                      ...layer.object.rubble,
                      energyRequired: value
                    }
                  })
                }
              />
            </label>
            <label className="block">
              Agents Required:
              <NumberInput
                name="agentsRequired"
                value={layer.object.rubble?.agentsRequired ?? 0}
                min={1}
                onChange={(_, value) =>
                  onUpdate({
                    rubble: {
                      ...layer.object.rubble,
                      agentsRequired: value
                    }
                  })
                }
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
