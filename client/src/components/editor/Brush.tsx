import { useState } from "react"
import Field from "@/components/editor/Field"
import { EditorBrush } from "@/core/Brushes"

export default function Brush({ brush }: { brush: EditorBrush }): JSX.Element {
  const objectTypeField = brush.fields.objectType
  const [objectType, setObjectType] = useState(() => objectTypeField?.value as string)

  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-lg font-bold">{brush.name}</h2>

      {Object.entries(brush.fields).map(([key, field]) => {
        const isObjectType = key === "objectType"
        const isFieldForType = key.startsWith(objectType + "_")

        if (!isObjectType && objectTypeField && !isFieldForType) {
          return null
        }

        return (
          <Field
            key={key}
            field={field}
            onChange={isObjectType ? (val) => setObjectType(val) : undefined}
          />
        )
      })}
    </div>
  )
}
