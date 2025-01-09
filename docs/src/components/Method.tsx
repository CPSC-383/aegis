import { Badge } from "@/components/ui/badge";

interface Parameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}

interface Props {
  description: string;
  parameters?: Parameter[];
  returns?: {
    type: string;
    description?: string;
  };
}

export default function Method({
  description,
  parameters = [],
  returns,
}: Props) {
  return (
    <div>
      <p className="my-2 text-muted-foreground">{description}</p>

      {parameters.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold border-b pb-1 mb-2">Parameters</h4>
          <div>
            {parameters.map((param) => (
              <div key={param.name} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono">{param.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {param.type}
                  </Badge>
                  {param.required && (
                    <Badge variant="destructive" className="text-xs">
                      required
                    </Badge>
                  )}
                </div>
                {param.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {param.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {returns && (
        <div className="mt-6">
          <div>
            <h4 className="font-semibold border-b pb-1 mb-2">Returns</h4>
          </div>

          {returns.description && (
            <p className="text-sm text-muted-foreground">
              {returns.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
