import {writeFile} from "fs/promises";
import {Data, DepInfo} from "license-checker-rseidelsohn";
import {
  title as mdTitle,
  list as mdList,
  width as mdWidth,
  TitleLevel,
} from "./markdown.js";
import {
  pCheck,
  selfName,
} from "./util.js";

const MAX_WIDTH = 100;

/** Header for production/development versions */
const getHeader = (production: boolean) => production
  ? "Packages and projects used by the executable/packaged part of the software"
  : "Packages and projects used for development tools and libraries";

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
${mdTitle(packageName, TitleLevel.level2)}
${pkg.description ?? "(no description provided)"}
${mdTitle(`Details for ${packageName}`, TitleLevel.level3)}
${
  mdList([
    `License type: ${pkg.licenses ?? "(undefined)"}`,
    `URL: ${pkg.url ? `<${pkg.url}>` : "(none provided)"}`,
    `Publisher: ${pkg.publisher ?? "(none provided)"}`,
  ])
}
${mdTitle(`License for ${packageName}`, TitleLevel.level3)}

\`\`\`text
${mdWidth(getLicense(pkg) ?? "(missing)", MAX_WIDTH)}
\`\`\`
`.substring(1);
};

/** Create a text summary of all licenses */
const getSummary = (packages: Data) => {
  const licenses: Record<string, number> = {};
  for (const pkg of Object.values(packages)) {
    const pkgLicense = pkg.licenses ?? "(unknown)";
    if (pkgLicense in licenses) {
      ++licenses[pkgLicense];
    } else {
      licenses[pkgLicense] = 1;
    }
  }
  const summaryList = Object.keys(licenses).map(licenseName => {
    const count = licenses[licenseName];
    return `${licenseName}: ${count}`;
  });
  return `Licenses summary:\n${mdList(summaryList)}`;
};

/**
 * Format the output as a markdown file
 *
 * @param production
 * Use the production header
 */
const makeOutput = (production: boolean, packages: Data) => `
${mdTitle(getHeader(production), TitleLevel.level1)}
${getSummary(packages)}

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
