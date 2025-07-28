import { EditorField, EditorBrushTypes } from '@/core/Brushes'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import NumberInput from '../NumberInput'

interface FieldProps {
  field: EditorField
  onChange?: (value: any) => void
}

export default function Field({ field, onChange }: FieldProps) {
  const handleChange = (newValue: any) => {
    const processedValue =
      field.type === EditorBrushTypes.POSITIVE_INTEGER ? Number(newValue) : newValue

    field.value = processedValue
    onChange?.(processedValue)
  }

  return (
    <div className="space-y-2">
      {field.label && (
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
      )}

      <div className="flex items-center gap-2">
        {field.type === EditorBrushTypes.POSITIVE_INTEGER && (
          <NumberInput
            name={field.label}
            value={field.value}
            min={1}
            max={100}
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
