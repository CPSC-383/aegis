import APIReference from "@/components/APIReference";
import DocPage from "@/components/DocPage";
import MethodDoc from "@/components/MethodDoc";
import { Square } from "lucide-react";

function CellDocs() {
  return (
    <DocPage
      title="Cell"
      description="Represents a cell in the world."
      icon={Square}
    >
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The Cell class is a fundamental unit within the world grid,
          representing individual tiles that agents interact with. Each cell has
          properties like movement cost, location, and whether it contains
          survivors. It also supports advanced features, including layered
          content and type-specific behaviors such as charging, fire, and killer
          properties.
        </p>
      </section>

      <section id="attributes" className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Attributes
        </h2>
        <APIReference
          name="move_cost"
          type="int"
          description="The movement cost associated with the cell."
        />
        <APIReference
          name="location"
          type="Location"
          link="/docs/common/location"
          description="The location of the cell on the map."
        />
        <APIReference
          name="has_survivors"
          type="bool"
          description="If there are survivors in the cell."
        />
      </section>

      <section id="methods">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Methods
        </h2>
        <MethodDoc
          name="get_top_layer()"
          description="Returns the top layer of the cell without removing it."
          returns={{
            type: "WorldObject | None",
            description:
              "The top layer of the cell if it exists, or None if the cell has no layers.",
          }}
          example={`# cell with survivor as top layer with default values
top_layer = cell.get_top_layer()
print(top_layer)
# Output: SV(0, 0, 0, 0)

# cell with no top layer 
top_layer = cell.get_top_layer()
print(top_layer)
# Output: None `}
        />
        <MethodDoc
          name="is_charging_cell()"
          description="Determines whether the cell is of type CHARGING_CELL."
          returns={{
            type: "bool",
            description:
              "True if the cell is a CHARGING_CELL, otherwise False.",
          }}
          example={`# The cell is a CHARGING_CELL
print(cell.is_charging_cell())
# Output: True

# The cell is not a CHARGING_CELL
print(cell.is_charging_cell())
# Output: False`}
        />
        <MethodDoc
          name="is_fire_cell()"
          description="Determines whether the cell is of type FIRE_CELL."
          returns={{
            type: "bool",
            description: "True if the cell is a FIRE_CELL, otherwise False.",
          }}
          example={`# The cell is a FIRE_CELL
print(cell.is_fire_cell())
# Output: True

# The cell is not a FIRE_CELL
print(cell.is_fire_cell())
# Output: False`}
        />
        <MethodDoc
          name="is_killer_cell()"
          description="Determines whether the cell is of type KILLER_CELL."
          returns={{
            type: "bool",
            description: "True if the cell is a KILLER_CELL, otherwise False.",
          }}
          example={`# The cell is a KILLER_CELL
print(cell.is_killer_cell())
# Output: True

# The cell is not a KILLER_CELL
print(cell.is_killer_cell())
# Output: False`}
        />
        <MethodDoc
          name="is_normal_cell()"
          description="Determines whether the cell is of type NORMAL_CELL."
          returns={{
            type: "bool",
            description: "True if the cell is a NORMAL_CELL, otherwise False.",
          }}
          example={`# The cell is a NORMAL_CELL
print(cell.is_normal_cell())
# Output: True

# The cell is not a NORMAL_CELL
print(cell.is_normal_cell())
# Output: False`}
        />
      </section>
    </DocPage>
  );
}

export default CellDocs;
