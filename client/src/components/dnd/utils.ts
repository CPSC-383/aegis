import { schema } from "aegis-schema";

export const getObjectId = (obj: schema.WorldObject): string => {
  if (obj.object.oneofKind === "survivor") {
    return `survivor-${obj.object.survivor.id}`;
  } else if (obj.object.oneofKind === "rubble") {
    return `rubble-${obj.object.rubble.id}`;
  }
  return "unknown";
};

export const getObjectName = (obj: schema.WorldObject): string => {
  if (obj.object.oneofKind === "survivor") {
    return "Survivor"
  } else if (obj.object.oneofKind === "rubble") {
    return "Rubble"
  }
  return "unknown";
}
