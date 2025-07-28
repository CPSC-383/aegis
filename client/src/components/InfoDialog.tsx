import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'

interface InfoDialogProps {
  trigger: React.ReactNode
  title: string
  children: React.ReactNode
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function InfoDialog({
  trigger,
  title,
  children,
  description,
  open,
  onOpenChange
}: InfoDialogProps) {
  ;<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        {children}
      </DialogHeader>
    </DialogContent>
  </Dialog>
}

export default InfoDialog
