import { SurvivorInfo } from '@/utils/types'
import NumberInput from '@/components/inputs/NumberInput'
import { Zap } from 'lucide-react'

interface Props {
    survivorInfo: SurvivorInfo
    setSurvivorInfo: (info: SurvivorInfo) => void
}

function SurvivorSettings({ survivorInfo, setSurvivorInfo }: Props) {
    return (
        <NumberInput
            value={survivorInfo.energy_level}
            onChange={(newEnergy) => setSurvivorInfo({ ...survivorInfo, energy_level: newEnergy })}
            min={0}
            extraStyles="w-full"
            label={'Energy Level:'}
            icon={Zap}
        />
    )
}

export default SurvivorSettings
