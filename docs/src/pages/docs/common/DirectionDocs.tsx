import APIReference from "@/components/APIReference";
import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import MethodDoc from "@/components/MethodDoc";
import { Compass } from "lucide-react";

function DirectionDocs() {
  return (
    <DocPage
      title="Direction"
      description="Enum representing different directions, used for navigating the world."
      icon={Compass}
    >
      <section className="mb-8">
        <h2
          id="overview"
          className="text-2xl font-semibold mb-4 dark:text-white"
        >
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The Direction class provides a flexible and powerful interface for
          working with two-dimensional coordinates. It defines a set of cardinal
          directions that can be used for navigating the world.
        </p>
      </section>

      <section className="mb-8">
        <h2
          id="attributes"
          className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white"
        >
          Attributes
        </h2>

        <APIReference
          name="NORTH"
          type="tuple"
          description="Direction that points north (up)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the NORTH direction."
            defaultValue={0}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the NORTH direction."
            defaultValue={1}
          />
        </APIReference>

        <APIReference
          name="NORTH_EAST"
          type="tuple"
          description="Direction that points northeast (up and right)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the NORTH_EAST direction."
            defaultValue={1}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the NORTH_EAST direction."
            defaultValue={1}
          />
        </APIReference>

        <APIReference
          name="EAST"
          type="tuple"
          description="Direction that points east (right)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the EAST direction."
            defaultValue={1}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the EAST direction."
            defaultValue={0}
          />
        </APIReference>

        <APIReference
          name="SOUTH_EAST"
          type="tuple"
          description="Direction that points southeast (down and right)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the SOUTH_EAST direction."
            defaultValue={1}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the SOUTH_EAST direction."
            defaultValue={-1}
          />
        </APIReference>

        <APIReference
          name="SOUTH"
          type="tuple"
          description="Direction that points south (down)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the SOUTH direction."
            defaultValue={0}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the SOUTH direction."
            defaultValue={-1}
          />
        </APIReference>

        <APIReference
          name="SOUTH_WEST"
          type="tuple"
          description="Direction that points southwest (down and left)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the SOUTH_WEST direction."
            defaultValue={-1}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the SOUTH_WEST direction."
            defaultValue={-1}
          />
        </APIReference>

        <APIReference
          name="WEST"
          type="tuple"
          description="Direction that points west (left)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the WEST direction."
            defaultValue={-1}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the WEST direction."
            defaultValue={0}
          />
        </APIReference>

        <APIReference
          name="NORTH_WEST"
          type="tuple"
          description="Direction that points northwest (up and left)."
        >
          <APIReference
            name="dx"
            type="int"
            description="The change in the x-coordinate when moving in the NORTH_WEST direction."
            defaultValue={-1}
          />
          <APIReference
            name="dy"
            type="int"
            description="The change in the y-coordinate when moving in the NORTH_WEST direction."
            defaultValue={1}
          />
        </APIReference>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Methods
        </h2>
        <MethodDoc
          name="get_random_direction()"
          description="Returns a random cardinal direction."
          returns={{
            type: "Direction",
            description: "A random cardinal direction.",
          }}
          example={`dir = Direction.get_random_direction()
# Returns Direction.NORTH 

dir = Direction.get_random_direction()
# Returns Direction.SOUTH_EAST`}
        />
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Additional Notes
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          The <code>Direction</code> enum supports iteration, allowing you to
          easily loop over all defined directions. This can be useful when you
          need to process each direction or perform operations on every
          direction. For example, you can loop over the directions like this:
        </p>
        <CodeBlock language="python">{`for direction in Direction:\n  print(direction)`}</CodeBlock>
      </section>
    </DocPage>
  );
}

export default DirectionDocs;
