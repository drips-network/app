import fs from 'fs';

export default function (path: string) {
  const img = fs.readFileSync(path);
  const base64bg = Buffer.from(img).toString('base64');
  return 'data:image/jpeg;base64,' + base64bg;
}
