import { z } from 'zod';

const metadatumSchema = z.object({
  icon: z.string(),
  title: z.string(),
  text: z.string(),
  link: z.object({
    href: z.string(),
    label: z.string(),
  }),
});

const nodeSchema = z.object({
  projectAccountId: z.string().nullable(),
  repoOwner: z.string(),
  repoName: z.string(),
  absoluteWeight: z.number(),
  // TODO: does this exist?
  metadata: z.optional(metadatumSchema),
});

const newNodeScehma = z.object({
  projectName: z.string(),
});

const edgeSchema = z.object({
  // TODO: null is not a valid source
  source: z.string().or(z.null()),
  target: z.string(),
  // TODO: should we standardize on a number or a string?
  weight: z.string().or(z.number()),
});

const graphSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

// TODO: fr?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const newGraphSchema = graphSchema.extend({
  nodes: z.array(newNodeScehma),
});

const avatarSchema = z.object({
  type: z.string(),
  emoji: z.string(),
});

export const ecosystemSchema = z.object({
  id: z.optional(z.string()),
  name: z.string(),
  description: z.optional(z.string().or(z.null())),
  state: z.optional(z.string()),
  chainId: z.optional(z.string()),
  ownerAccountId: z.optional(z.string()),
  ownerAddress: z.optional(z.string()),
  avatar: z.optional(avatarSchema),
  color: z.optional(z.string()),
  metadata: z.array(metadatumSchema),
  nodeCount: z.optional(z.number()),
  graph: graphSchema,
});

const ecosystemWithoutGraphSchema = ecosystemSchema.omit({ graph: true });

export const getAllSchema = z.array(ecosystemWithoutGraphSchema);
export const getSchema = ecosystemSchema;
export const createSchema = z.object({ id: z.string() });

export type Ecosystem = z.infer<typeof ecosystemSchema>;
export type LeanEcosystem = z.infer<typeof ecosystemWithoutGraphSchema>;
export type Graph = z.infer<typeof graphSchema>;
export type NewGraph = z.infer<typeof newGraphSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type NewNode = z.infer<typeof newNodeScehma>;
export type Edge = z.infer<typeof edgeSchema>;
