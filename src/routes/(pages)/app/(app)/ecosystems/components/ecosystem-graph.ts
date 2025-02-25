import type { Attributes } from 'graphology-types';
import type { NodeDisplayData, PartialButFor, EdgeDisplayData } from 'sigma/types';
import type { Settings } from 'sigma/settings';

export type LayoutMapping = { [key: string]: { x: number; y: number } };
export type NodeSelectionChangedPayload = { nodeId?: string };

export async function fetchProject(ownerName: string, repoName: string, forge: string = 'github') {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(forge)}/${encodeURIComponent(ownerName)}/${encodeURIComponent(repoName)}`,
  );
  // probably throw an error?
  if (!response.ok) {
    return null;
  }

  const projectData = await response.json();
  return projectData;
}

/**
 * https://github.com/jacomyal/sigma.js/blob/f5f397854b19e95d55fd0b4b9de5cdebfaa3f159/packages/sigma/src/rendering/edge-labels.ts
 *
 * @param context
 * @param edgeData
 * @param sourceData
 * @param targetData
 * @param settings
 * @returns
 */
export function drawStraightEdgeLabel<
  N extends Attributes = Attributes,
  E extends Attributes = Attributes,
  G extends Attributes = Attributes,
>(
  context: CanvasRenderingContext2D,
  edgeData: PartialButFor<EdgeDisplayData, 'label' | 'color' | 'size'>,
  sourceData: PartialButFor<NodeDisplayData, 'x' | 'y' | 'size'>,
  targetData: PartialButFor<NodeDisplayData, 'x' | 'y' | 'size'>,
  settings: Settings<N, E, G>,
): void {
  const size = settings.edgeLabelSize,
    font = settings.edgeLabelFont,
    weight = settings.edgeLabelWeight,
    color = settings.edgeLabelColor.attribute
      ? edgeData[settings.edgeLabelColor.attribute] || settings.edgeLabelColor.color || '#000'
      : settings.edgeLabelColor.color;

  let label = edgeData.label;

  if (!label) return;

  context.fillStyle = color;
  context.font = `${weight} ${size}px ${font}`;

  // Computing positions without considering nodes sizes:
  const sSize = sourceData.size;
  const tSize = targetData.size;
  let sx = sourceData.x;
  let sy = sourceData.y;
  let tx = targetData.x;
  let ty = targetData.y;
  let cx = (sx + tx) / 2;
  let cy = (sy + ty) / 2;
  let dx = tx - sx;
  let dy = ty - sy;
  let d = Math.sqrt(dx * dx + dy * dy);

  if (d < sSize + tSize) return;

  // Adding nodes sizes:
  sx += (dx * sSize) / d;
  sy += (dy * sSize) / d;
  tx -= (dx * tSize) / d;
  ty -= (dy * tSize) / d;
  cx = (sx + tx) / 2;
  cy = (sy + ty) / 2;
  dx = tx - sx;
  dy = ty - sy;
  d = Math.sqrt(dx * dx + dy * dy);

  // Handling ellipsis
  let textLength = context.measureText(label).width;

  if (textLength > d) {
    const ellipsis = '…';
    label = label + ellipsis;
    textLength = context.measureText(label).width;

    while (textLength > d && label.length > 1) {
      label = label.slice(0, -2) + ellipsis;
      textLength = context.measureText(label).width;
    }

    if (label.length < 4) return;
  }

  const PADDING_X = 8;
  const PADDING_Y = 8;

  const boxWidth = textLength + 2 * PADDING_X;
  const boxHeight = size + 2 * PADDING_Y;

  context.save();
  context.translate(cx, cy);

  context.beginPath();
  context.fillStyle = edgeData.labelBackgroundColor;
  context.roundRect(
    -textLength / 2 - PADDING_X,
    -PADDING_Y / 2,
    boxWidth,
    boxHeight,
    [16, 0, 16, 16],
  );
  context.closePath();
  context.fill();

  context.fillStyle = color;
  context.fillText(label, -textLength / 2, edgeData.size / 2 + size);

  context.restore();
}

/**
 * https://github.com/jacomyal/sigma.js/blob/f5f397854b19e95d55fd0b4b9de5cdebfaa3f159/packages/sigma/src/rendering/node-labels.ts#L16
 * @param context
 * @param data
 * @param settings
 * @returns
 */
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
 * https://github.com/jacomyal/sigma.js/blob/f5f397854b19e95d55fd0b4b9de5cdebfaa3f159/packages/sigma/src/rendering/node-hover.ts#L23
 *
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
