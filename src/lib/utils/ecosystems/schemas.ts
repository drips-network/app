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
  projectName: z.string(),
  metadata: z.optional(metadatumSchema),
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

export const ecosystemSchema = z.object({
  name: z.string(),
  chainId: z.string(),
  ownerAccountId: z.string(),
  metadata: z.array(metadatumSchema),
  graph: graphSchema,
});

// {
//   "name": "test",
//   "chainId": "11155111",
//   "ownerAccountId": "ownerAccountId",
//   "metadata": {
//       "icon": "icon",
//       "title": "title",
//       "text": "text",
//       "link": {
//           "href": "http://href.com",
//           "label": "label"
//       }
//   },
//   "graph": {
//       "nodes": [
//           {
//               "projectName": "root"
//           },
//           {
//               "projectName": "drips-network/app",
//               "metadata": {
//                   "icon": "icon",
//                   "title": "title",
//                   "text": "text",
//                   "link": {
//                       "href": "http://href.com",
//                       "label": "label"
//                   }
//               }
//           },
//           {
//               "projectName": "drips-network/multiplayer"
//           },
//           {
//               "projectName": "drips-network/graphql-api"
//           }
//       ],
//       "edges": [
//           {
//               "source": "root",
//               "target": "drips-network/app",
//               "weight": 100
//           },
//           {
//               "source": "drips-network/app",
//               "target": "drips-network/multiplayer",
//               "weight": 0.1
//           },
//           {
//               "source": "drips-network/app",
//               "target": "drips-network/graphql-api",
//               "weight": 0.1
//           }
//       ]
//   }
// }

export type Ecosytem = z.infer<typeof ecosystemSchema>;
