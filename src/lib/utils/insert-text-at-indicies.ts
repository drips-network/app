export default function insertTextAtIndices(
  content: string,
  replacements: { [key: number]: string },
): string {
  return content.replace(/./g, (character, index) => {
    return replacements[index] ? replacements[index] + character : character;
  });
}
