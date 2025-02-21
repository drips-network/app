import { drawDiscNodeLabel } from 'sigma/rendering';
import type { Attributes } from 'graphology-types';
import type { NodeDisplayData, PartialButFor } from 'sigma/types';
import type { Settings } from 'sigma/settings';

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
    weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;

  // Then we draw the label background
  context.fillStyle = data.labelBackgroundColor;
  // context.shadowOffsetX = 0;
  // context.shadowOffsetY = 0;
  // context.shadowBlur = 8;
  // context.shadowColor = "#000";

  const PADDING_Y = 5;
  const PADDING_X = 5;
  const MARGIN_X = 0;
  const BORDER_WIDTH = data.borderSize;

  if (typeof data.label === 'string') {
    const textWidth = context.measureText(data.label).width,
      boxWidth = Math.round(textWidth + 2 * PADDING_X),
      boxHeight = Math.round(size + 2 * PADDING_Y);
    // radius = Math.max(data.size, size / 2) + PADDING_Y;

    // const angleRadian = Math.asin(boxHeight / 2 / radius);
    // const xDeltaCoord = Math.sqrt(Math.abs(Math.pow(radius, 2) - Math.pow(boxHeight / 2, 2)));

    context.beginPath();
    // context.moveTo(data.x + xDeltaCoord + MARGIN_X, data.y + boxHeight / 2);
    // context.lineTo(data.x + radius + boxWidth, data.y + boxHeight / 2);
    // context.lineTo(data.x + radius + boxWidth, data.y - boxHeight / 2);
    // context.lineTo(data.x + xDeltaCoord + MARGIN_X, data.y - boxHeight / 2);
    context.roundRect(
      data.x + data.size + BORDER_WIDTH + MARGIN_X,
      data.y - boxHeight / 2,
      boxWidth,
      boxHeight,
      [8, 0, 8, 8],
    );
    // context.arc(data.x, data.y, radius, angleRadian, -angleRadian);
    context.closePath();
    context.fill();
  } else {
    context.beginPath();
    // context.arc(data.x, data.y, data.size + PADDING, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  }

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

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
