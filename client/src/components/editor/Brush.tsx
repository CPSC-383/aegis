import { EditorBrush } from "@/core/Brushes"
import Field from "@/components/editor/Field"

export default function Brush({ brush }: { brush: EditorBrush }): JSX.Element {
  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-lg font-bold">{brush.name}</h2>
      {Object.values(brush.fields).map((field, i) => (
        <div key={i}>
          <Field field={field} />
        </div>
      ))}
    </div>
  )
}
