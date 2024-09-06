import Button from '../Button'

type Props = {
    isOpen: boolean
    setupAegisPath: () => void
}

function Settings({ isOpen, setupAegisPath }: Props) {
    if (!isOpen) return null
    return (
        <div className="space-y-2">
            <Button onClick={setupAegisPath} label="Reconfigure Aegis Path" styles="bg-primary text-sm" />
        </div>
    )
}

export default Settings
