/* eslint-disable no-console */

// script that takes a file as input and replaces the following strings:
// - #5555FF -> var(--color-primary)
// - #C0C0FF -> var(--color-primary-level-2)
// - #000000 -> var(--color-foreground)
// - black -> var(--color-foreground)
// - #28333D -> var(--color-foreground)
// - white -> var(--color-background)
// - #FFFFFF -> var(--color-background)
// - #EAEAFF -> var(--color-primary-level-1)

import fs from 'fs';
import path from 'path';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path as an argument.');
  process.exit(1);
}

const fileName = path.basename(filePath);

const fileContent = fs.readFileSync(filePath, 'utf8');

const updatedContent = fileContent
  .replace(/#5555FF/g, 'var(--color-primary)')
  .replace(/#C0C0FF/g, 'var(--color-primary-level-2)')
  .replace(/#000000/g, 'var(--color-foreground)')
  .replace(/black/g, 'var(--color-foreground)')
  .replace(/#28333D/g, 'var(--color-foreground)')
  .replace(/white/g, 'var(--color-background)')
  .replace(/#FFFFFF/g, 'var(--color-background)')
  .replace(/#EAEAFF/g, 'var(--color-primary-level-1)');

// replace file in place
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log(`Updated ${fileName} with theme variables.`);
