import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

import Round from '@/core/Round'
import { Vector } from '@/types'
import {
  Building2,
  GripVertical,
  Layers3,
  MapPin,
  Save,
  Trash2,
  User,
  X
} from 'lucide-react'
import NumberInput from './NumberInput'

interface Props {
  tile: Vector | undefined
  round: Round | undefined
  onClose: () => void
}

export default function LayerEditor({ tile, round, onClose }: Props) {
  if (!tile || !round) return null

  const originalLayers = round.world.cellAt(tile.x, tile.y).layers
  const [layers, setLayers] = useState([...originalLayers])
  const [hasChanges, setHasChanges] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const handleSave = () => {
    round.world.cellAt(tile.x, tile.y).layers = [...layers]
    setHasChanges(false)
    onClose()
  }

  const handleCancel = () => {
    if (hasChanges) {
      setLayers([...originalLayers])
    }
    onClose()
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = layers.findIndex((_, i) => `layer-${i}` === active.id)
      const newIndex = layers.findIndex((_, i) => `layer-${i}` === over.id)
      setLayers((items) => arrayMove(items, oldIndex, newIndex))
      setHasChanges(true)
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
    setHasChanges(true)
  }

  const deleteLayer = (index: number) => {
    setLayers((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'survivor':
        return <User className="w-4 h-4" />
      case 'rubble':
        return <Building2 className="w-4 h-4" />
      default:
        return <Layers3 className="w-4 h-4" />
    }
  }

  const getLayerColor = (type: string) => {
    switch (type) {
      case 'survivor':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rubble':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={!!tile} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <DialogTitle className="text-lg">Layers Editor</DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-2">
            <span>
              Position: ({tile.x}, {tile.y})
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {layers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Layers3 className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No layers on this tile
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Layers will appear here when added
                  </p>
                </CardContent>
              </Card>
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
                      getLayerIcon={getLayerIcon}
                      getLayerColor={getLayerColor}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
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
  onUpdate,
  getLayerIcon,
  getLayerColor
}: {
  id: string
  layer: any
  index: number
  onDelete: () => void
  onUpdate: (updates: any) => void
  getLayerIcon: (type: string) => React.ReactNode
  getLayerColor: (type: string) => string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? 'shadow-lg rotate-2 scale-105' : 'hover:shadow-md'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex flex-col items-start my-3 gap-0.5">
              <span className="text-md text-muted-foreground">Layer {index + 1}</span>
              <Badge
                className={`${getLayerColor(layer.object.oneofKind)} font-medium pointer-events-none`}
              >
                {getLayerIcon(layer.object.oneofKind)}
                <span className="ml-1 capitalize">{layer.object.oneofKind}</span>
              </Badge>
            </div>
          </div>

          {layer.object.oneofKind === 'survivor' && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-row items-center gap-2">
                <Label htmlFor={`health-${index}`} className="text-sm font-medium">
                  Health
                </Label>
                <NumberInput
                  name="health"
                  value={layer.object.survivor.health}
                  min={1}
                  max={100}
                  onChange={(_, value) =>
                    onUpdate({
                      survivor: {
                        ...layer.object.survivor,
                        health: value
                      }
                    })
                  }
                />
              </div>
            </div>
          )}

          {layer.object.oneofKind === 'rubble' && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`energy-${index}`} className="text-sm font-medium">
                    Energy Required
                  </Label>
                  <NumberInput
                    name="energyRequired"
                    value={layer.object.rubble?.energyRequired ?? 0}
                    min={1}
                    max={999}
                    onChange={(_, value) =>
                      onUpdate({
                        rubble: {
                          ...layer.object.rubble,
                          energyRequired: value
                        }
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`agents-${index}`} className="text-sm font-medium">
                    Agents Required
                  </Label>
                  <NumberInput
                    name="agentsRequired"
                    value={layer.object.rubble?.agentsRequired ?? 0}
                    min={1}
                    max={10}
                    onChange={(_, value) =>
                      onUpdate({
                        rubble: {
                          ...layer.object.rubble,
                          agentsRequired: value
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
