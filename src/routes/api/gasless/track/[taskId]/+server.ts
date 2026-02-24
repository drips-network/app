import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { relayer } from '../../gelato';
import { StatusCode } from '@gelatocloud/gasless';

function mapStatus(code: StatusCode): string {
  switch (code) {
    case StatusCode.Pending:
      return 'pending';
    case StatusCode.Submitted:
      return 'submitted';
    case StatusCode.Success:
      return 'success';
    case StatusCode.Rejected:
      return 'rejected';
    case StatusCode.Reverted:
      return 'reverted';
  }
}

export const GET: RequestHandler = async ({ params }) => {
  if (!relayer) {
    return error(503, 'Gelato Relayer client not initialized');
  }

  const result = await relayer.getStatus({ id: params.taskId });

  return new Response(
    JSON.stringify({
      status: mapStatus(result.status),
      transactionHash: 'hash' in result ? result.hash : null,
      message: 'message' in result ? result.message : null,
    }),
  );
};
