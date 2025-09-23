import { getAuditLog } from '$lib/utils/rpgf/rpgf.js';

export const load = async ({ parent, fetch }) => {
  const { round } = await parent();

  const auditLog = await getAuditLog(fetch, round.id);

  return {
    auditLog: auditLog.logs,
  };
};
