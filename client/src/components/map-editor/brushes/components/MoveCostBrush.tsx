import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Props {
  moveCost: number
  setMoveCost: (cost: number) => void
}

function MoveCostBrush({ moveCost, setMoveCost }: Props): JSX.Element {
  const clampMoveCost = (value: number): number => {
    return Math.max(1, Math.min(1000, value))
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-5 grid-rows-2 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cost) => (
            <Button
              key={cost}
              variant={moveCost === cost ? 'default' : 'outline'}
              onClick={() => setMoveCost(cost)}
              className="w-6 h-6 text-sm p-0"
            >
              {cost}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Custom:</span>
          <Input
            type="number"
            value={moveCost === 0 ? '' : moveCost}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Number(e.target.value)
              setMoveCost(value)
            }}
            onBlur={(e) => {
              const value = e.target.value === '' ? 0 : Number(e.target.value)
              setMoveCost(clampMoveCost(value)) // Just clamp number after they stop typing
            }}
            className="w-20"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default MoveCostBrush
