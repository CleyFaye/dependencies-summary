import {writeFile} from "fs-extra";
import {readFileSync} from "fs-extra";
import {pCheck} from "./util";
import {selfName} from "./util";

/** Header for production/development versions
 * 
 * @param {bool} production
 * 
 * @return {string}
 */
const getHeader = production =>
  production
    ? "Licenses used by the executable/packaged part of the software"
    : "Licenses used for development tools and libraries";

/** Remove extra spaces at end of line */
const trimLicense = licenseText => licenseText.split("\n").map(
  line => line.trimRight()
).join("\n");

/** Get the license text.
 * 
 * Sometimes license-checker decides to grab the readme as the license file.
 * Most of the time this is bad, so we exclude them.
 */
const getLicense = packageDef => {
  if (packageDef.licenseFile.toLowerCase().indexOf("readme") != -1) {
    return "(not provided)";
  }
  return trimLicense(packageDef.licenseText);
};

/** Format a package definition as markdown */
const formatPackage = (packages, packageName) => `
## ${packageName}

${packages[packageName].description || "(no description provided)"}

### Details for ${packageName}

- License type: ${packages[packageName].licenses}
- URL: ${packages[packageName].url
    ? `<${packages[packageName].url}>`
    : "(none provided)"}
- Publisher: ${packages[packageName].publisher || "(none provided)"}

### License for ${packageName}

\`\`\`text
${getLicense(packages[packageName])}
\`\`\`
`.substring(1);

/** Format the output as a markdown file
 * 
 * @param {bool} production
 * Use the production header
 * 
 * @return {function}
 * Function usable in a promise stack
 */
const makeOutput = production => packages => `
# ${getHeader(production)}

${Object.keys(packages).map(
    key => formatPackage(
      packages,
      key
    ).trim()
  ).join("\n\n")}
`.substring(1);

/** Output the full license listing
 * 
 * @param {string} outputPath
 * Output file path
 * 
 * @param {bool} production
 * Output only production if true, only development if false
 * 
 * @return {Promise}
 */
export default (outputPath, production) =>
  selfName(
  ).then(
    selfPackageName => pCheck({
      start: ".",
      production,
      development: !production,
      excludePackages: selfPackageName,
      customPath: {
        description: null,
        publisher: null,
        url: null,
        licenses: null,
        licenseFile: null,
        licenseText: null,
      },
    })
  ).then(
    makeOutput(production)
  ).then(
    data => writeFile(outputPath, data)
  );