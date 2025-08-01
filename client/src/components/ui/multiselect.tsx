import { Check, X, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className = '',
}: MultiSelectProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectAll = () => {
    const unselected = options.filter(opt => !selected.includes(opt))
    onChange([...selected, ...unselected])
  }

  const clearAll = () => {
    onChange([])
  }

  const isAllSelected = options.length > 0 && options.every(opt => selected.includes(opt))

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {selected.length} selected
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {options.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={isAllSelected ? clearAll : selectAll}
              className="h-7 text-xs"
            >
              {!isAllSelected && (
                <>
                  <Square />
                  Select All
                </>
              )}
            </Button>
          )}

          {selected.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto border border-input rounded-md bg-background">
        {options.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No worlds available
          </div>
        ) : (
          <ul className="divide-y divide-border" role="listbox" aria-multiselectable="true">
            {options.map((opt) => {
              const isSelected = selected.includes(opt)
              return (
                <li
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors group focus-within:bg-accent focus-within:text-accent-foreground"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleOption(opt)
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      const nextItem = e.currentTarget.nextElementSibling as HTMLElement
                      if (nextItem) nextItem.focus()
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      const prevItem = e.currentTarget.previousElementSibling as HTMLElement
                      if (prevItem) prevItem.focus()
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`flex-shrink-0 w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-all ${isSelected
                        ? 'bg-primary border-primary scale-110'
                        : 'border-muted-foreground/30 group-hover:border-muted-foreground/50 group-hover:scale-105'
                        }`}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="truncate text-sm font-medium">
                      {opt}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
