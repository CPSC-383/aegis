import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Props {
    moveCost: number
    setMoveCost: (cost: number) => void
}

function MoveCostBrush({ moveCost, setMoveCost }: Props) {
    return (
        <Card className="w-full">
            <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Move Cost</span>
                    <div className="flex space-x-2">
                        {[2, 3, 4, 5].map((cost) => (
                            <Button
                                key={cost}
                                variant={moveCost === cost ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setMoveCost(cost)}
                            >
                                {cost}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Custom:</span>
                    <Input
                        type="number"
                        value={moveCost === 0 ? '' : moveCost}
                        onChange={(e) => {
                            const value = e.target.value
                            if (value === '' || (/^\d+$/.test(value) && Number(value) > 1)) {
                                setMoveCost(value === '' ? 0 : Number(value))
                            }
                        }}
                        className="w-20"
                        min={2}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default MoveCostBrush
