import {readJSON} from "fs-extra";
import {promisify} from "util";
import checker from "license-checker";

/** Promise-based license-checker */
export const pCheck = promisify((opt, cb) => checker.init(opt, cb));

/** List name of dependencies for production/development
 *
 * @param {bool} production
 * List only production dependencies if true, only development dependencies if
 * false.
 *
 * @return {Promise<string[]>}
 * List of dependencies
 */
export const getDependencies = production => readJSON("package.json")
  .then(
    pkg => Object.keys(
      // Some properties might be undefined
      production
        ? (pkg.dependencies || {})
        : (pkg.devDependencies || {}),
    ),
  );

/** Return only the packages that match the provided list
 *
 * @param {Object} checkerOutput
 * The output of license-checker
 *
 * @param {string[]} packageNames
 * The name of packages to look for
 *
 * @return {Promise<Object>}
 * An object similar to checkerOutput but with only the requested packages
 */
export const filterPackages = (checkerOutput, packageNames) => Promise.resolve(
  Object.keys(checkerOutput).reduce(
    (result, packageWithVersion) => {
      const packageWithoutVersion = packageWithVersion.slice(
        0,
        packageWithVersion.lastIndexOf("@"),
      );
      if (packageNames.includes(packageWithoutVersion)) {
        result[packageWithVersion] = checkerOutput[packageWithVersion];
      }
      return result;
    },
    {},
  ),
);

/** Return the name provided in package.json
 *
 * @return {Promise<string>}
 * Name (with @version)
 */
export const selfName = () => readJSON("package.json")
  .then(data => `${data.name}@${data.version}`);
