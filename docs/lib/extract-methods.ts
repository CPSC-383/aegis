type MethodInfo = {
  name: string;
  description: string;
};

export function extractMethods(content: string): MethodInfo[] {
  const methodRegex = /<Method\s+([^>]+?)\/>/g;
  const propRegex = /(\w+)="([^"]+)"/g;

  const methods: MethodInfo[] = [];

  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const props = match[1];
    const method: Partial<MethodInfo> = {};

    let propMatch;
    while ((propMatch = propRegex.exec(props)) !== null) {
      const [, key, value] = propMatch;
      if (key === "name" || key === "description") {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        (method as any)[key] = value;
      }
    }

    if (method.name && method.description) {
      methods.push(method as MethodInfo);
    }
  }

  return methods;
}
