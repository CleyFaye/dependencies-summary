import {writeFile} from "fs-extra";
import {
  getDependencies,
  filterPackages,
  pCheck,
} from "./util";

/**
 * Split license-checker output into production and dev dependencies
 *
 * @param {Object} checkerOutput
 * The output of license-checker
 *
 * @return {Promise<Object>}
 * An object with a "production" and a "development" properties.
 * These properties each have a value similar to the output of license-checker
 * but filtered accordingly.
 */
const splitOutputs = checkerOutput => Promise.all([
  getDependencies(true),
  getDependencies(false),
]).then(([prodDeps, devDeps]) => Promise.all([
  filterPackages(checkerOutput, prodDeps),
  filterPackages(checkerOutput, devDeps),
]))
  .then(([production, development]) => ({
    production,
    development,
  }));

/**
 * Make a markdown list from a list of packages
 *
 * @param {Object} packages
 * List of packages
 *
 * @return {string}
 */
const makeList = packages => Object.keys(packages).map(
  key => `- ${key} (${packages[key].licenses})`,
)
  .join("\n");

/**
 * Format the splitted output from splitOutputs to markdown
 *
 * @param {Object} splittedOutput
 * Output from splitOutputs()
 *
 * @return {string}
 * Markdown content
 */
const formatOutput = splittedResult => `
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
 * @param {string} outputPath
 * Path for output file
 *
 * @return {Promise}
 */
export default outputPath => pCheck({start: "."}).then(
  splitOutputs,
)
  .then(
    formatOutput,
  )
  .then(
    data => writeFile(outputPath, data),
  );
