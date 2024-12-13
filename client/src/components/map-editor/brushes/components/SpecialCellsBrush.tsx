import { SpawnZoneTypes, SpecialCellBrushTypes } from '@/utils/types'
import NumberInput from '@/components/inputs/NumberInput'
import { Flame, PlusCircle, Zap, Users, User, Tag, Skull } from 'lucide-react'
import Dropdown from '@/components/Dropdown'

interface Props {
    specialCellType: SpecialCellBrushTypes
    setSpecialCellType: (type: SpecialCellBrushTypes) => void
    spawnZoneType: SpawnZoneTypes
    setSpawnZoneType: (type: SpawnZoneTypes) => void
    gid: number
    setGid: (gid: number) => void
}

function SpecialCellsBrush({
    specialCellType,
    setSpecialCellType,
    spawnZoneType,
    setSpawnZoneType,
    gid,
    setGid
}: Props) {
    const specialCellItems = Object.values(SpecialCellBrushTypes).map((type) => ({
        value: type,
        icon: {
            [SpecialCellBrushTypes.Killer]: Skull,
            [SpecialCellBrushTypes.Fire]: Flame,
            [SpecialCellBrushTypes.Charging]: Zap,
            [SpecialCellBrushTypes.Spawn]: PlusCircle
        }[type]
    }))

    const spawnZoneItems = Object.values(SpawnZoneTypes).map((type) => ({
        value: type,
        icon: {
            [SpawnZoneTypes.Any]: Users,
            [SpawnZoneTypes.Group]: User
        }[type]
    }))

    return (
        <>
            <Dropdown
                items={specialCellItems}
                selectedItem={specialCellType}
                onSelect={(item) => setSpecialCellType(item as SpecialCellBrushTypes)}
            />
            {specialCellType === SpecialCellBrushTypes.Spawn && (
                <>
                    <Dropdown
                        items={spawnZoneItems}
                        onSelect={(item) => setSpawnZoneType(item as SpawnZoneTypes)}
                        selectedItem={spawnZoneType}
                        label={'Type:'}
                    />
                    {spawnZoneType === SpawnZoneTypes.Group && (
                        <NumberInput
                            value={gid}
                            onChange={(newGid) => setGid(newGid)}
                            min={0}
                            extraStyles="w-full"
                            label={'GID:'}
                            icon={Tag}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default SpecialCellsBrush
