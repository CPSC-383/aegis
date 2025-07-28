import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Renderer } from '@/core/Renderer'
import { Vector } from '@/types'
import Round from '@/core/Round'

interface Props {
  tile: Vector | undefined
  round: Round | undefined
  onClose: () => void
}

export default function LayerEditor({ tile, round, onClose }: Props) {
  if (!tile || !round) return null

  const layers = round.world.cellAt(tile.x, tile.y).layers

  return (
    <Dialog open={!!tile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Layers at ({tile.x}, {tile.y})</DialogTitle>
          <DialogDescription>
            Inspect and manage all layers applied to the selected tile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {layers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No layers on this tile.</p>
          ) : (
            layers.map((layer, index) => (
              <div key={index} className="border p-2 rounded text-sm">
                <div>
                  <strong>Layer {index + 1}</strong>: {layer.object.oneofKind}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => onClose()}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
