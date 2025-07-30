import { useEffect, useRef, useState } from "react";
import LayerItem from "./LayerItem";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge";
import { flushSync } from "react-dom";
import { schema } from "aegis-schema";
import { getObjectId } from "./utils";

interface Props {
  originalLayers: schema.WorldObject[];
}

export default function LayerList({ originalLayers }: Props) {
  const containerRef = useRef<HTMLUListElement | null>(null);
  const [layers, setLayers] = useState([...originalLayers]);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return source.data?.id != null;
      },
      onDrop: ({ source, location }) => {
        const dest = location.current.dropTargets[0];
        if (!dest) return;

        const sourceId = source.data.id as string;
        const destId = dest.data.id as string;
        const closestEdge = extractClosestEdge(dest.data);

        const sourceIndex = layers.findIndex((layer) => getObjectId(layer) === sourceId);
        const destIndex = layers.findIndex((layer) => getObjectId(layer) === destId);

        flushSync(() => {
          setLayers((prev) => {
            if (sourceIndex < 0 || destIndex < 0) return prev;
            return reorderWithEdge({
              list: prev,
              startIndex: sourceIndex,
              indexOfTarget: destIndex,
              closestEdgeOfTarget: closestEdge,
              axis: "vertical",
            });
          });
        });
      },
    });
  }, [layers]);

  return (
    <div className="flex w-full">
      <ul className="flex flex-col w-96 p-2 gap-2 relative" ref={containerRef}>
        {layers.map((layer) => (
          <LayerItem
            layer={layer}
            id={getObjectId(layer)}
            key={getObjectId(layer)}
          />
        ))}
      </ul>
    </div>
  );
}
