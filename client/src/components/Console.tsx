import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ConsoleLine } from '@/types'
import { Maximize2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  output: ConsoleLine[]
}

export default function Console({ output }: Props): JSX.Element {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const highlightMatch = (text: string, query: string): JSX.Element => {
    if (!query) return <>{text}</>

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, i) => (
          <span
            key={i}
            className={part.toLowerCase() === query.toLowerCase() ? 'bg-yellow-200' : ''}
          >
            {part}
          </span>
        ))}
      </>
    )
  }

  const renderOutput = (): JSX.Element => {
    return (
      <div className="h-full p-2 border-2 border-accent-light rounded-md text-xs overflow-auto whitespace-nowrap scrollbar">
        {output.map((line, id) => {
          const matches = searchTerm && line.message.toLowerCase().includes(searchTerm.toLowerCase())
          return (
            <div
              key={id}
              className={`${line.has_error ? 'text-destructive' : ''} ${matches ? 'bg-muted' : ''}`}
            >
              {highlightMatch(line.message, searchTerm)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-full mt-8 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold">Console</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsPopupOpen(true)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        {renderOutput()}
      </div>
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent
          className="min-w-[90vw] h-[90vh] flex flex-col"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearchTerm("")
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Console</DialogTitle>
            <DialogDescription>Press ESC to close</DialogDescription>
          </DialogHeader>
          <div className="mb-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {renderOutput()}
        </DialogContent>
      </Dialog>
    </>
  )
}
