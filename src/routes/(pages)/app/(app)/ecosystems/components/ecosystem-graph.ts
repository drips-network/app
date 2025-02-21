// import { drawDiscNodeLabel } from 'sigma/rendering';
import type { Attributes } from 'graphology-types';
import type { NodeDisplayData, PartialButFor } from 'sigma/types';
import type { Settings } from 'sigma/settings';

export function drawDiscNodeLabel<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes,
>(
  context: CanvasRenderingContext2D,
  data: PartialButFor<NodeDisplayData, 'x' | 'y' | 'size' | 'label' | 'color'>,
  settings: Settings<N, E, G>,
): void {
  if (!data.label) return;

  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight,
    color = settings.labelColor.attribute
      ? data[settings.labelColor.attribute] || settings.labelColor.color || '#000'
      : settings.labelColor.color;

  const labelParts = data.label.split('/');
  const firstPart = `${labelParts[0]}/`;

  context.fillStyle = color;
  context.font = `normal ${size}px ${font}`;
  context.fillText(firstPart, data.x + data.size + 3, data.y + size / 3);

  const firstPartWidth = context.measureText(firstPart).width;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(labelParts[1], data.x + data.size + 3 + firstPartWidth, data.y + size / 3);
}

/**
 * Draw an hovered node.
 * - if there is no label => display a shadow on the node
 * - if the label box is bigger than node size => display a label box that contains the node with a shadow
 * - else node with shadow and the label box
 */
export function drawDiscNodeHover<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes,
>(
  context: CanvasRenderingContext2D,
  data: PartialButFor<NodeDisplayData, 'x' | 'y' | 'size' | 'label' | 'color'>,
  settings: Settings<N, E, G>,
): void {
  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight,
    color = settings.labelColor.attribute
      ? data[settings.labelColor.attribute] || settings.labelColor.color || '#000'
      : settings.labelColor.color;

  context.font = `${weight} ${size}px ${font}`;

  const PADDING_Y = 8;
  const PADDING_X = 8;
  const MARGIN_X = 0;
  const LABEL_BORDER_WIDTH = 1;
  const BORDER_WIDTH = data.borderSize;

  if (typeof data.label === 'string') {
    // TODO: do we care that this isn't exactly right because the
    // last part of the label is bold?
    const textWidth = context.measureText(data.label).width,
      boxWidth = Math.round(textWidth + 2 * PADDING_X),
      boxHeight = Math.round(size + 2 * PADDING_Y);

    // draw border
    context.beginPath();
    context.fillStyle = color;
    context.roundRect(
      data.x + data.size + BORDER_WIDTH + MARGIN_X - LABEL_BORDER_WIDTH,
      data.y - boxHeight / 2 - LABEL_BORDER_WIDTH,
      boxWidth + LABEL_BORDER_WIDTH * 2,
      boxHeight + LABEL_BORDER_WIDTH * 2,
      [16, 0, 16, 16],
    );
    context.closePath();
    context.fill();

    // draw label content background
    context.beginPath();
    context.fillStyle = data.labelBackgroundColor;
    context.roundRect(
      data.x + data.size + BORDER_WIDTH + MARGIN_X,
      data.y - boxHeight / 2,
      boxWidth,
      boxHeight,
      [16, 0, 16, 16],
    );
    context.closePath();
    context.fill();
  } else {
    // TODO: remove?
    context.beginPath();
    context.closePath();
    context.fill();
  }

  // And finally we draw the label
  drawDiscNodeLabel(
    context,
    {
      ...data,
      // undo drawDiscNodeLabel defaults and then add our own spacing
      x: data.x - data.size - 3 + data.size + BORDER_WIDTH + MARGIN_X + PADDING_X,
    },
    settings,
  );
}
