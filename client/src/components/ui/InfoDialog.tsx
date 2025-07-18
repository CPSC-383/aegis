import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog'

interface InfoDialogProps {
  trigger: React.ReactNode
  title: string
  children: React.ReactNode
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  trigger,
  title,
  children,
  description,
  open,
  onOpenChange
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        {children}
      </DialogHeader>
    </DialogContent>
  </Dialog>
)

export default InfoDialog
