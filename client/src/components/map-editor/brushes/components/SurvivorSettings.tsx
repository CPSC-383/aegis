import { SurvivorInfo } from '@/utils/types'
import NumberInput from '@/components/inputs/NumberInput'

interface Props {
    survivorInfo: SurvivorInfo
    setSurvivorInfo: (info: SurvivorInfo) => void
}

function SurvivorSettings({ survivorInfo, setSurvivorInfo }: Props) {
    return (
        <div className="flex mt-4 items-center justify-center">
            <p className="mr-2">Energy Level:</p>
            <NumberInput
                value={survivorInfo.energy_level}
                onChange={(newEnergy) => setSurvivorInfo({ ...survivorInfo, energy_level: newEnergy })}
                min={0}
                extraStyles="w-16"
            />
        </div>
    )
}

export default SurvivorSettings
