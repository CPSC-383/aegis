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
import { Vector } from '@/types'
import Round from '@/core/Round'

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

  return (
    <Dialog open={!!tile} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit Layers at ({tile.x}, {tile.y})
          </DialogTitle>
          <DialogDescription>
            Inspect and manage all layers applied to the selected tile.
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
  index
}: {
  id: string
  layer: any
  index: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="border p-2 rounded text-sm bg-background"
    >
      <div>
        <strong>Layer {index + 1}</strong>: {layer.object.oneofKind}
      </div>
      <div className="pl-2 mt-1 space-y-1 text-muted-foreground text-xs">
        {layer.object.oneofKind === 'survivor' && (
          <div>Health: {layer.object.survivor?.health}</div>
        )}

        {layer.object.oneofKind === 'rubble' && (
          <>
            <div>Energy Required: {layer.object.rubble?.energyRequired}</div>
            <div>Agents Required: {layer.object.rubble?.agentsRequired}</div>
          </>
        )}
      </div>
    </div>
  )
}
