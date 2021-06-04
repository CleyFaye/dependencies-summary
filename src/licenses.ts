import {writeFile} from "fs/promises";
import {Data, DepInfo} from "license-checker-rseidelsohn";
import {
  pCheck,
  selfName,
} from "./util.js";

/** Header for production/development versions */
const getHeader = (production: boolean) => production
  ? "Licenses used by the executable/packaged part of the software"
  : "Licenses used for development tools and libraries";

/** Remove extra spaces at end of line */
const trimLicense = (licenseText?: string) => licenseText?.split("\n").map(
  line => line.trimRight(),
)
  .join("\n");

/**
 * Get the license text.
 *
 * Sometimes license-checker decides to grab the readme as the license file.
 * Most of the time this is bad, so we exclude them.
 */
const getLicense = (packageDef: DepInfo) => {
  if (packageDef.licenseFile?.toLowerCase().indexOf("readme") !== -1) {
    return "(not provided)";
  }
  return trimLicense(packageDef.licenseText);
};

/** Format a package definition as markdown */
const formatPackage = (packages: Data, packageName: string) => {
  const pkg = packages[packageName];
  return `
## ${packageName}

${pkg.description ?? "(no description provided)"}

### Details for ${packageName}

- License type: ${pkg.licenses ?? "(undefined)"}
- URL: ${pkg.url
    ? `<${pkg.url}>`
    : "(none provided)"}
- Publisher: ${pkg.publisher ?? "(none provided)"}

### License for ${packageName}

\`\`\`text
${getLicense(pkg) ?? "(missing)"}
\`\`\`
`.substring(1);
};

/**
 * Format the output as a markdown file
 *
 * @param production
 * Use the production header
 */
const makeOutput = (production: boolean, packages: Data) => `
# ${getHeader(production)}

${Object.keys(packages).map(
    key => formatPackage(
      packages,
      key,
    ).trim(),
  )
    .join("\n\n")}
`.substring(1);

/**
 * Output the full license listing
 *
 * @param outputPath
 * Output file path
 *
 * @param production
 * Output only production if true, only development if false
 */
export default async (outputPath: string, production: boolean): Promise<void> => {
  const selfPackageName = await selfName();
  const pkgListing = await pCheck({
    start: ".",
    production,
    development: !production,
    excludePackages: [selfPackageName],
    customPath: {
      description: null,
      publisher: null,
      url: null,
      licenses: null,
      licenseFile: null,
      licenseText: null,
    },
  });
  const output = makeOutput(production, pkgListing);
  await writeFile(outputPath, output);
};
