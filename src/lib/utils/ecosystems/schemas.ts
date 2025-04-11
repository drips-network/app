import { z } from 'zod';

const metadatumSchema = z.object({
  icon: z.string(),
  title: z.string(),
  text: z.string().optional(),
  link: z
    .object({
      href: z.string(),
      label: z.string(),
    })
    .optional(),
});

const nodeSchema = z.object({
  projectAccountId: z.string().nullable(),
  repoOwner: z.string(),
  repoName: z.string(),
  absoluteWeight: z.number(),
  metadata: z.optional(metadatumSchema),
});

const newNodeScehma = z.object({
  projectName: z.string(),
});

const edgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  weight: z.number().positive(),
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
  accountId: z.optional(z.string().or(z.null())),
  ownerAddress: z.optional(z.string()),
  avatar: z.optional(avatarSchema),
  color: z.optional(z.string()),
  metadata: z.array(metadatumSchema),
  nodeCount: z.optional(z.number()),
  graph: graphSchema,
});

const ecosystemWithoutGraphSchema = ecosystemSchema.omit({ graph: true });

export const getAllResponseSchema = z.array(ecosystemWithoutGraphSchema);
export const getResponseSchema = ecosystemSchema;
export const createResponseSchema = z.object({ id: z.string() });
export const deployResponseSchema = z.object({ message: z.string() });

export type Ecosystem = z.infer<typeof ecosystemSchema>;
export type LeanEcosystem = z.infer<typeof ecosystemWithoutGraphSchema>;
export type Graph = z.infer<typeof graphSchema>;
export type NewGraph = z.infer<typeof newGraphSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type NewNode = z.infer<typeof newNodeScehma>;
export type Edge = z.infer<typeof edgeSchema>;
