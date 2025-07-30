import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import {
  type Edge,
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { createPortal } from "react-dom";
import { schema } from "aegis-schema";
import { getObjectId, getObjectName } from "./utils";

interface ListItemProps {
  layer: schema.WorldObject;
  id: string;
}

type TaskState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement; rect: DOMRect }
  | { type: "is-over"; edge: Edge; rect: DOMRect }
  | { type: "dragging-left-self" };

export default function LayerItem({ layer, id }: ListItemProps) {
  const itemRef = useRef<HTMLLIElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TaskState>({ type: "idle" });

  useEffect(() => {
    const mainElement = mainRef.current;
    const element = itemRef.current;
    if (!element || !mainElement) return;

    return combine(
      draggable({
        element: element,
        getInitialData: () => ({ layer, id }),
        onDrop: () => {
          setState({ type: "idle" });
        },
        onGenerateDragPreview({ nativeSetDragImage, location }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: element,
              input: location.current.input,
            }),
            render({ container }) {
              setState({
                type: "preview",
                container,
                rect: element.getBoundingClientRect(),
              });
            },
          });
        },
      }),
      dropTargetForElements({
        element: mainElement,
        getIsSticky: () => true,
        getData: ({ element, input }) => {
          const trueId = getObjectId(layer);
          return attachClosestEdge(
            { layer, id: trueId },
            { element, input, allowedEdges: ["top", "bottom"] },
          );
        },
        canDrop({ source }) {
          if (source.data.item === null) {
            return false;
          }
          return true;
        },
        onDragEnter({ source, self }) {
          if (getObjectId(source.data.layer as schema.WorldObject) === getObjectId(layer)) return;
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;
          setState({
            type: "is-over",
            rect: element.getBoundingClientRect(),
            edge: closestEdge,
          });
        },
        onDrag({ self, source }) {
          const closestEdge = extractClosestEdge(self.data);
          if (self.data.id === source.data.id && closestEdge) return;
          if (!closestEdge) return;
          const proposedChanges: TaskState = {
            type: "is-over",
            rect: element.getBoundingClientRect(),
            edge: closestEdge,
          };
          setState(proposedChanges);
        },
        onDragLeave: ({ source }) => {
          if (source.data.id === getObjectId(layer)) {
            setState({ type: "dragging-left-self" });
            return;
          }
          setState({ type: "idle" });
        },
        onDrop: () => {
          setState({ type: "idle" });
        },
      }),
    );
  }, [layer, id]);

  return (
    <>
      {state.type === "is-over" && state.edge === "top" ? (
        <DragShadow rect={state.rect} />
      ) : null}
      <div
        ref={mainRef}
        className={state.type === "dragging-left-self" ? "hidden" : ""}
      >
        <li className="bg-gray-200 p-2 rounded-lg cursor-grab" ref={itemRef}>
          {getObjectName(layer)}
        </li>
      </div>
      {state.type === "is-over" && state.edge === "bottom" ? (
        <DragShadow rect={state.rect} />
      ) : null}
      {state.type === "preview"
        ? createPortal(
          <DragPreview task={layer} state={state} />,
          state.container,
        )
        : null}
    </>
  );
}

function DragShadow({ rect }: { rect: DOMRect }) {
  return (
    <div
      style={{ width: rect.width, height: rect.height }}
      className="bg-slate-400 rounded-lg"
    ></div>
  );
}

function DragPreview({ task, state }: { task: schema.WorldObject; state: TaskState }) {
  return (
    <div
      className="border-solid rounded-lg p-2 bg-gray-300 rotate-[4deg]"
      style={
        state.type === "preview"
          ? { width: state.rect.width, height: state.rect.height }
          : undefined
      }
    >
      {getObjectName(task)}
    </div>
  );
}
