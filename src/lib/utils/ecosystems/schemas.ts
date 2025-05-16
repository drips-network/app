import { z } from 'zod';

const metadatumSchema = z.object({
  icon: z.string(),
  title: z.string(),
  text: z.string().optional(),
  link: z.object({
    href: z.string(),
    label: z.string(),
  }),
});

const nodeSchema = z.object({
  projectAccountId: z.string().nullable(),
  repoOwner: z.string(),
  repoName: z.string(),
  absoluteWeight: z.number().positive(),
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

const avatarSchema = z.object({
  type: z.string(),
  emoji: z.string(),
});

export const ecosystemSchema = z.object({
  id: z.string(),
  state: z.string(),
  accountId: z.string().nullable(),
  ownerAddress: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  metadata: z.array(metadatumSchema),
  graph: graphSchema,
  avatar: avatarSchema,
  color: z.string(),
});

export const ecosystemsListItemSchema = ecosystemSchema
  .omit({
    graph: true,
  })
  .extend({
    nodeCount: z.number().nullable(),
  });

const newGraphSchema = graphSchema.extend({
  nodes: z.array(newNodeScehma),
});

export const newEcosystemSchema = ecosystemSchema
  .omit({
    accountId: true,
  })
  .extend({
    graph: newGraphSchema,
    chainId: z.string(),
  });

export const getAllResponseSchema = z.array(ecosystemsListItemSchema);
export const getResponseSchema = ecosystemSchema;
export const createResponseSchema = z.object({ id: z.string() });
export const deployResponseSchema = z.object({ message: z.string() });

export type Ecosystem = z.infer<typeof ecosystemSchema>;
export type NewEcosystem = z.infer<typeof newEcosystemSchema>;
export type EcosystemsListItem = z.infer<typeof ecosystemsListItemSchema>;
export type Graph = z.infer<typeof graphSchema>;
export type NewGraph = z.infer<typeof newGraphSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type NewNode = z.infer<typeof newNodeScehma>;
export type Edge = z.infer<typeof edgeSchema>;
