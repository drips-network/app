import { goto } from '$app/navigation';

/**
 * Function used to simulate the behavior of a proper `a` element for a
 * navigation link, if for whatever reason using `a` isn't possible, and
 * some other element type needs to be used with an `on:click` handler.
 * Takes a `path` and `MouseEvent`, and either triggers `goto` or opens a
 * new tab if the `meta` or `ctrl` keys were pressed during the click.
 * @param path The path to navigate to.
 * @param event The mouse event that triggered the interaction.
 */
export default function (path: string, event: PointerEvent | MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.button === 1) {
    // Prevent handling if the event has already previoulsy hit an `a` element.
    if (event.composedPath().find((e) => e instanceof HTMLAnchorElement)) return;

    window?.open(path, '_blank');
  } else {
    goto(path);
  }
}
