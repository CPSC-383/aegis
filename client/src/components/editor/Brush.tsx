import Field from "@/components/editor/Field"
import { EditorBrush, EditorBrushTypes } from "@/core/Brushes"
import { useForceUpdate } from "@/utils/util"

export default function Brush({ brush }: { brush: EditorBrush }): JSX.Element {
  const forceUpdate = useForceUpdate()
  const objectTypeField = brush.fields.objectType
  const objectTypeValue = objectTypeField?.value
  const options = objectTypeField?.options || []

  const currentOption = options.find((opt) => opt.value === objectTypeValue)

  const nestedFields = currentOption?.attributes?.fields || {}

  const combinedFields = {
    ...brush.fields,
    ...nestedFields,
  }

  const selectFields = Object.entries(combinedFields).filter(
    ([, field]) => field.type === EditorBrushTypes.SINGLE_SELECT
  )
  const otherFields = Object.entries(combinedFields).filter(
    ([, field]) => field.type !== EditorBrushTypes.SINGLE_SELECT
  )

  const handleChange = (): void => {
    forceUpdate()
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col space-y-4">
        {selectFields.map(([key, field]) => (
          <div key={key}>
            <Field field={field} onChange={handleChange} />
          </div>
        ))}
      </div>

      <div
        className={`flex flex-row gap-2 flex-wrap ${selectFields.length === 0 ? "" : "mt-2"}`}
      >
        {otherFields.map(([key, field]) => (
          <div key={key} className="flex-1 min-w-[120px]">
            <Field field={field} onChange={handleChange} />
          </div>
        ))}
      </div>
    </div>
  )
}
