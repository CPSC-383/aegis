import APIReference from "@/components/APIReference";
import DocPage from "@/components/DocPage";
import MethodDoc from "@/components/MethodDoc";
import { MapPin } from "lucide-react";

function LocationDocs() {
  return (
    <DocPage
      title="Location"
      description="A comprehensive coordinate management system."
      icon={MapPin}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The Location class provides a robust interface for managing
          two-dimensional coordinates.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Attributes
        </h2>
        <APIReference
          name="x"
          type="int"
          description="Horizontal coordinate representing the x-axis position."
        />
        <APIReference
          name="y"
          type="int"
          description="Vertical coordinate representing the y-axis position."
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Methods
        </h2>
        <MethodDoc
          name="add(direction: Direction)"
          description="Adds the given direction to the current location."
          parameters={[
            {
              name: "direction",
              type: "Direction",
              link: "/docs/common/direction",
              description: "The direction to add to the current location.",
              required: true,
            },
          ]}
          returns={{
            type: "Location",
            description:
              "A new Location object one unit away in the given direction.",
          }}
          example={`# Example usage
loc = create_location(3, 2)
north_location = loc.add(Direction.NORTH)
# Returns location at (3, 3)`}
        />

        <MethodDoc
          name="direction_to(location: Location)"
          description="Calculate the cardinal direction between the current location and a target location."
          parameters={[
            {
              name: "location",
              type: "Location",
              description: "The target location.",
              required: true,
            },
          ]}
          returns={{
            type: "Direction",
            link: "/docs/common/direction",
            description:
              "A Direction enum value representing the cardinal direction between locations.",
          }}
          example={`# Example usage
start = create_location(0, 0)
goal = create_location(0, 5)
dir = start.direction_to(goal) 
# Returns Direction.NORTH`}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Factory Functions
        </h2>
        <MethodDoc
          name="create_location(x: int, y: int)"
          description="Create a new Location object at the specified coordinates."
          parameters={[
            {
              name: "x",
              type: "int",
              description: "The x-coordinate of the location.",
              required: true,
            },
            {
              name: "y",
              type: "int",
              description: "The y-coordinate of the location.",
              required: true,
            },
          ]}
          returns={{
            type: "Location",
            description: "A new Location object at the specified coordinates.",
          }}
          example={`# Example usage
loc = create_location(5, 4)
# Returns a Location object with the coordinates (5, 4)`}
        />
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Additional Notes
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          The <code>Location</code> class is designed to support comparison
          operations. Locations can be compared using standard operators such as{" "}
          <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>
          , <code>&lt;=</code>, and <code>&gt;=</code>. This allows for easy
          sorting and comparison of locations. For example, locations can be
          stored in sorted containers like lists, sets and heaps.
        </p>
      </section>
    </DocPage>
  );
}

export default LocationDocs;
