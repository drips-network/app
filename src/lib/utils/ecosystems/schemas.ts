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
  // TODO: githubUrl or projectName?
  githubUrl: z.optional(z.string()),
  projectName: z.optional(z.string()),
  metadata: z.optional(metadatumSchema),
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

export const ecosystemSchema = z.object({
  id: z.optional(z.string()),
  name: z.string(),
  description: z.optional(z.string().or(z.null())),
  chainId: z.optional(z.string()),
  ownerAccountId: z.optional(z.string()),
  ownerAddress: z.optional(z.string()),
  metadata: z.array(metadatumSchema),
  nodeCount: z.optional(z.number()),
  graph: z.optional(graphSchema),
});

export const getAllSchema = z.array(ecosystemSchema);
export const getSchema = ecosystemSchema;
// UUID of newly created graph
export const createSchema = z.string();

export type Ecosystem = z.infer<typeof ecosystemSchema>;
export type Graph = z.infer<typeof graphSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type Edge = z.infer<typeof edgeSchema>;
