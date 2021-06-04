/* eslint-disable @typescript-eslint/no-magic-numbers */
export enum TitleLevel {
  level1 = 1,
  level2 = 2,
  level3 = 3,
  level4 = 4,
  level5 = 5,
  level6 = 6,
}
/* eslint-enable @typescript-eslint/no-magic-numbers */

/** Make a markdown title string */
export const title = (value: string, level: TitleLevel): string => {
  if ([TitleLevel.level1, TitleLevel.level2].includes(level)) {
    const underlineChr = (level === TitleLevel.level1) ? "=" : "-";
    const underlineStr = underlineChr.repeat(value.length);
    return `${level === TitleLevel.level2 ? "\n" : ""}${value}\n${underlineStr}`;
  }
  return `\n${"#".repeat(level)} ${value}`;
};

/** Make a markdown list */
export const list = (elems: Array<string>): string => {
  const lines = elems.map(c => {
    const elemLines = c.split("\n");
    const firstLine = `- ${elemLines[0]}`;
    const nextLines = elemLines.slice(1).map(v => `  ${v}`);
    return [firstLine, ...nextLines].join("\n");
  });
  return `\n${lines.join("\n")}`;
};

/** Return the first occurrence of a space character going backward from startAt */
const findDelimiter = (text: string, startAt: number): number | null => {
  let cursor = startAt;
  while (cursor >= 0) {
    if ([" ", "\t"].includes(text[cursor])) {
      return cursor;
    }
    --cursor;
  }
  return null;
};

/** Limit text to given width, adding newlines as needed */
export const width = (text: string, maxWidth: number): string => {
  const inputRows = text.split("\n");
  const outputRows: Array<string> = [];
  for (const inRow of inputRows) {
    let row = inRow.trimEnd();
    while (row.length > maxWidth) {
      const splitDelimiter = findDelimiter(row, maxWidth);
      if (splitDelimiter === null) {
        outputRows.push(row);
        row = "";
      } else {
        const candidateRow = row.substr(0, splitDelimiter).trimEnd();
        outputRows.push(candidateRow);
        row = row.substr(splitDelimiter + 1).trim();
      }
    }
    if (row) {
      outputRows.push(row);
    }
  }
  return outputRows.join("\n");
};
