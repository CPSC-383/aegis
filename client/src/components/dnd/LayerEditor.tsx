import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'

import Round from '@/core/Round'
import { Vector } from '@/types'
import {
  MapPin,
} from 'lucide-react'
import LayerList from './LayerList'

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
        <LayerList originalLayers={originalLayers} />
      </DialogContent>
    </Dialog>
  )
}
