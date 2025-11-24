import z, { boolean } from 'zod';
import { waveUserDtoSchema } from './user';
import { filterSchema } from './filter';

export const waveAdminDtoSchema = z.object({
  id: z.uuid(),
  user: waveUserDtoSchema,
  createdAt: z.coerce.date(),
});
export type WaveAdminDto = z.infer<typeof waveAdminDtoSchema>;

export const createWaveDtoSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  cycleDayOfMonth: z.number().int().min(1).max(31),
  cycleDurationDays: z.number().int().min(1).max(365),
  presetBudgetUSD: z.string().regex(/^\d+(\.\d{1,2})?$/),
  avatarUrl: z.url().optional(),
});
export type CreateWaveDto = z.infer<typeof createWaveDtoSchema>;

export const updateWaveDtoSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  paused: z.boolean().optional(),
  cycleDayOfMonth: z.number().int().min(1).max(31).optional(),
  cycleDurationDays: z.number().int().min(1).max(365).optional(),
  presetBudgetUSD: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  avatarUrl: z.url().nullable().optional(),
});
export type UpdateWaveDto = z.infer<typeof updateWaveDtoSchema>;

export const addWaveAdminDtoSchema = z.object({
  email: z.email(),
});
export type AddWaveAdminDto = z.infer<typeof addWaveAdminDtoSchema>;

export const waveDtoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  paused: z.boolean(),
  cycleDayOfMonth: z.number().int(),
  cycleDurationDays: z.number().int(),
  presetBudgetUSD: z.string(),
  avatarUrl: z.url().nullable(),

  issueCount: z.number().int(),
  approvedRepoCount: z.number().int(),
  approvedOrgCount: z.number().int(),
  cycleCount: z.number().int(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type WaveDto = z.infer<typeof waveDtoSchema>;

export const waveFiltersSchema = filterSchema(
  z.object({
    paused: boolean().optional(),
  }),
);
export type WaveFilters = z.infer<typeof waveFiltersSchema>;

// ===========================
// Wave Repo Types
// ===========================

export const waveRepoStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type WaveRepoStatus = z.infer<typeof waveRepoStatusSchema>;

export const waveRepoDtoSchema = z.object({
  id: z.uuid(),
  waveId: z.uuid(),
  orgRepoId: z.uuid(),
  status: waveRepoStatusSchema,
  appliedAt: z.coerce.date(),
  appliedByUserId: z.uuid(),
  reviewedAt: z.coerce.date().nullable(),
  reviewedByUserId: z.uuid().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type WaveRepoDto = z.infer<typeof waveRepoDtoSchema>;

export const rejectWaveRepoDtoSchema = z.object({
  rejectionReason: z.string().min(1).max(5000).optional(),
});
export type RejectWaveRepoDto = z.infer<typeof rejectWaveRepoDtoSchema>;

export const waveRepoWithDetailsDtoSchema = z.object({
  id: z.uuid(),
  status: waveRepoStatusSchema,
  appliedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  rejectionReason: z.string().nullable(),
  repo: z.object({
    id: z.uuid(),
    gitHubRepoName: z.string(),
    gitHubRepoFullName: z.string(),
    gitHubRepoUrl: z.string(),
    description: z.string().nullable(),
  }),
  appliedBy: waveUserDtoSchema,
  reviewedBy: waveUserDtoSchema.nullable(),
});
export type WaveRepoWithDetailsDto = z.infer<typeof waveRepoWithDetailsDtoSchema>;
