import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EditorBrushTypes, EditorField } from "@/core/Brushes"
import { useState } from "react"
import NumberInput from "../NumberInput"

interface FieldProps {
  field: EditorField
  onChange: () => void
}

export default function Field({ field, onChange }: FieldProps): JSX.Element {
  const [, setInternal] = useState(String(field.value))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (newValue: any): void => {
    const processedValue =
      field.type === EditorBrushTypes.POSITIVE_INTEGER ? Number(newValue) : newValue

    field.value = processedValue
    setInternal(processedValue)
    onChange?.()
  }

  return (
    <div className="">
      {field.label && (
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
      )}

      <div className="flex items-center gap-2">
        {field.type === EditorBrushTypes.POSITIVE_INTEGER && (
          <NumberInput
            name={field.label}
            value={field.value}
            min={1}
            max={1000}
            onChange={(_, val) => handleChange(val)}
          />
        )}

        {field.type === EditorBrushTypes.SINGLE_SELECT && field.options && (
          <Select value={String(field.value)} onValueChange={handleChange}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="Select option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt, i) => (
                <SelectItem key={i} value={String(opt.value)} className="text-sm">
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
