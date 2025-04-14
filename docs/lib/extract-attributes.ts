type AttributeInfo = {
  name: string;
  type: string;
  description: string;
};

export function extractAttributes(content: string): AttributeInfo[] {
  const attributeRegex = /<Attribute\s+([^>]+?)\/>/g;
  const propRegex = /(\w+)="([^"]+)"/g;

  const attributes: AttributeInfo[] = [];

  let match;
  while ((match = attributeRegex.exec(content)) !== null) {
    const props = match[1];
    const attr: Partial<AttributeInfo> = {};

    let propMatch;
    while ((propMatch = propRegex.exec(props)) !== null) {
      const [, key, value] = propMatch;
      (attr as any)[key] = value;
    }

    if (attr.name && attr.type && attr.description) {
      attributes.push(attr as AttributeInfo);
    }
  }

  return attributes;
}
