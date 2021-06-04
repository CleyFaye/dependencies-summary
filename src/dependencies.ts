import {writeFile} from "fs/promises";
import {Data} from "license-checker-rseidelsohn";
import {
  getDependencies,
  filterPackages,
  pCheck,
} from "./util.js";

interface SplitOutput {
  production: Data,
  development: Data,
}

/**
 * Split license-checker output into production and dev dependencies
 *
 * @param checkerOutput
 * The output of license-checker
 *
 * @return
 * An object with a "production" and a "development" properties.
 * These properties each have a value similar to the output of license-checker
 * but filtered accordingly.
 */
const splitOutputs = async (checkerOutput: Data) => ({
  production: filterPackages(checkerOutput, await getDependencies(true)),
  development: filterPackages(checkerOutput, await getDependencies(false)),
});

/**
 * Make a markdown list from a list of packages
 *
 * @param packages
 * List of packages
 *
 * @return {string}
 */
const makeList = (packages: Data) => Object.keys(packages).map(
  key => `- ${key} (${packages[key].licenses ?? "(undefined)"})`,
)
  .join("\n");

/**
 * Format the splitted output from splitOutputs to markdown
 *
 * @param splittedOutput
 * Output from splitOutputs()
 *
 * @return
 * Markdown content
 */
const formatOutput = (splittedResult: SplitOutput) => `
Dependencies and libraries
==========================

Production
----------

The following libraries and dependencies are required for the execution of this
package, program or library:

${makeList(splittedResult.production)}

Development
-----------

The following libraries and dependencies are required for development/building:

${makeList(splittedResult.development)}
`.substring(1);

/**
 * List all direct and indirect dependencies in an output file.
 *
 * @param outputPath
 * Path for output file
 *
 * @return
 */
export default async (outputPath: string): Promise<void> => {
  const data = await pCheck({start: "."});
  const splitted = await splitOutputs(data);
  const formatted = formatOutput(splitted);
  await writeFile(outputPath, formatted);
};
