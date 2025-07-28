import { useState } from 'react'
import Field from '@/components/editor/Field'
import { EditorBrush } from '@/core/Brushes'

export default function Brush({ brush }: { brush: EditorBrush }): JSX.Element {
  const objectTypeField = brush.fields.objectType
  const [objectType, setObjectType] = useState(() => objectTypeField?.value as string)

  const generalFields = []
  const objectFields = []

  for (const [key, field] of Object.entries(brush.fields)) {
    if (key === 'objectType') {
      generalFields.push(
        <Field key={key} field={field} onChange={(val) => setObjectType(val)} />
      )
    } else if (!objectTypeField) {
      generalFields.push(<Field key={key} field={field} />)
    } else if (key.startsWith(objectType + '_')) {
      objectFields.push(<Field key={key} field={field} />)
    }
  }

  return (
    <div className="space-y-4 px-1">
      {generalFields.length > 0 && <div className="space-y-2">{generalFields}</div>}

      {objectTypeField && objectFields.length > 0 && (
        <div className="space-y-2 mt-2">
          <div className="flex flex-col md:flex-row md:flex-wrap md:gap-4">
            {objectFields}
          </div>
        </div>
      )}
    </div>
  )
}
