import Button from '../Button'

type Props = {
    isOpen: boolean
    setupAegisPath: () => void
    aegisPath: string
}

function Settings({ isOpen, setupAegisPath, aegisPath }: Props) {
    if (!isOpen) return null
    return (
        <div className="space-y-2 flex flex-col items-center">
            <p className="text-sm">{aegisPath}</p>
            <Button onClick={setupAegisPath} label="Reconfigure Aegis Path" styles="bg-primary text-sm" />
        </div>
    )
}

export default Settings
