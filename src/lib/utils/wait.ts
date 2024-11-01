export default function wait(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
