import APIReference from "@/components/APIReference";
import DocPage from "@/components/DocPage";
import MethodDoc from "@/components/MethodDoc";
import { Grid3x3 } from "lucide-react";

function WorldDocs() {
  return (
    <DocPage
      title="World"
      description="Represents a 2D grid of cells, forming the foundation for navigation."
      icon={Grid3x3}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The World class represents a two-dimensional grid system designed for
          cell-based navigation. It serves as the core data structure that your
          agents will interact with, supporting key functionalities such as
          movement, pathfinding, and cell manipulation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Attributes
        </h2>
        <APIReference
          name="width"
          type="int"
          description="The width of the world. Ranging from 0 (inclusive) to the width (exclusive). "
        />
        <APIReference
          name="height"
          type="int"
          description="The height of the world. Ranging from 0 (inclusive) to the height (exclusive). "
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Methods
        </h2>
        <MethodDoc
          name="get_world_grid()"
          description="Returns the 2D grid representing the world."
          returns={{
            type: "list[list[Cell]]",
            link: "/docs/world/cell",
            description:
              "A two-dimensional list of Cell objects representing the world's grid structure.",
          }}
          example={`# world has height and width set to 3 for this example.

for row in world.get_world_grid():
    for cell in row:
        print(cell)

# Output: 
Cell ( (0,0), Move_Cost 1)
                {
                }
Cell ( (0,1), Move_Cost 1)
                {
                }
.
.
.

Cell ( (2,2), Move_Cost 1)
                {
                }`}
        />
        <MethodDoc
          name="get_cell_at(location: Location)"
          description="Returns the cell at the given location if it exists."
          parameters={[
            {
              name: "location",
              type: "Location",
              link: "/docs/common/location",
              description: "The location of the cell.",
              required: true,
            },
          ]}
          returns={{
            type: "Cell | None",
            link: "/docs/world/cell",
            description:
              "The Cell object at the given location, or None if the location is invalid or out of bounds.",
          }}
          example={`# world has height and width set to 3 for this example.

# Valid location
loc = create_location(1, 1)
print(world.get_cell_at(loc))

# Outputs:
Cell ( (1,1), Move_Cost 1)
              {
                # Stack Content here, if there are any layers.       
              }

# Invalid location
loc = create_location(4, 1)
print(world.get_cell_at(loc))

# Outputs:
None`}
        />
        <MethodDoc
          name="on_map(location: Location)"
          description="Checks if a given location is on the map."
          parameters={[
            {
              name: "location",
              type: "Location",
              link: "/docs/common/location",
              description: "The location to check.",
              required: true,
            },
          ]}
          returns={{
            type: "bool",
            description: "True if the location is on the map, False otherwise.",
          }}
          example={`# world has height and width set to 3 for this example.

>>> world.on_map(create_location(3,3))
False
>>> world.on_map(create_location(1, 2))
True`}
        />
      </section>
    </DocPage>
  );
}

export default WorldDocs;
