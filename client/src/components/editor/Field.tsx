import { EditorField, EditorBrushTypes } from "@/core/Brushes"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface FieldProps {
  field: EditorField
  onChange?: (value: any) => void
}

export default function Field({ field, onChange }: FieldProps) {
  const [value, setValue] = useState(field.value)

  const handleChange = (newValue: any) => {
    const processedValue = field.type === EditorBrushTypes.POSITIVE_INTEGER
      ? Number(newValue)
      : newValue

    field.value = processedValue
    setValue(newValue)

    // so layersbrush rerenders when the layer type changes
    onChange?.(processedValue)
  }

  return (
    <div className="space-y-2">
      {field.label && (
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {field.label}
        </Label>
      )}

      <div className="flex items-center gap-2">
        {field.type === EditorBrushTypes.POSITIVE_INTEGER && (
          <Input
            type="number"
            min={1}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-20 h-9 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="1"
          />
        )}

        {field.type === EditorBrushTypes.SINGLE_SELECT && field.options && (
          <Select value={String(value)} onValueChange={handleChange}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="Select option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt, i) => (
                <SelectItem
                  key={i}
                  value={String(opt.value)}
                  className="text-sm"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
