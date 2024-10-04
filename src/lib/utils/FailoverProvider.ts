/* eslint-disable @typescript-eslint/no-explicit-any */
import type { JsonRpcApiProviderOptions, JsonRpcPayload, JsonRpcResult, Networkish } from 'ethers';
import { JsonRpcProvider, FetchRequest } from 'ethers';

/**
 * A `JsonRpcProvider` that transparently fails over to a list of backup JSON-RPC endpoints.
 */
export class FailoverJsonRpcProvider extends JsonRpcProvider {
  private readonly _rpcEndpoints: (string | FetchRequest)[];

  /**
   * @param rpcEndpoints An array of JSON-RPC endpoints. The order determines the failover order.
   */
  constructor(
    rpcEndpoints: (string | FetchRequest)[],
    network?: Networkish,
    options?: JsonRpcApiProviderOptions,
  ) {
    super(rpcEndpoints[0], network, options);

    this._rpcEndpoints = rpcEndpoints;
  }

  /**
   * Overrides the `_send` method to try each endpoint until the request succeeds.
   *
   * @param payload - The JSON-RPC payload or array of payloads to send.
   * @returns A promise that resolves to the result of the first successful JSON-RPC call.
   */
  public override async _send(
    payload: JsonRpcPayload | Array<JsonRpcPayload>,
  ): Promise<Array<JsonRpcResult>> {
    // The actual sending of the request is the same as in the base class.
    // The only difference is that we're creating a new `FetchRequest` for each endpoint,
    // instead of getting the `request` from `_getConnection()`, which will return the *primary* (first) endpoint.

    const errors: { rpcEndpoint: string; error: any }[] = [];

    // Try each endpoint, in order.
    for (const rpcEndpoint of this._rpcEndpoints) {
      try {
        let request: FetchRequest;

        if (typeof rpcEndpoint === 'string') {
          request = new FetchRequest(rpcEndpoint);
        } else {
          request = rpcEndpoint.clone();
        }

        request.body = JSON.stringify(payload);
        request.setHeader('content-type', 'application/json');
        const response = await request.send();
        response.assertOk();

        let resp = response.bodyJson;
        if (!Array.isArray(resp)) {
          resp = [resp];
        }

        return resp;
      } catch (error: any) {
        const endpointUrl = this._getRpcEndpointUrl(rpcEndpoint);
        errors.push({ rpcEndpoint: endpointUrl, error });
      }
    }

    // All endpoints failed. Throw an error containing the details.
    const errorMessages = errors
      .map((e) => `Endpoint '${e.rpcEndpoint}' failed with error: ${e.error.message}.`)
      .join('\n');

    const aggregatedError = new Error(`All RPC endpoints failed:\n${errorMessages}`) as Error & {
      errors: { rpcEndpoint: string; error: any }[];
    };

    aggregatedError.errors = errors;

    throw aggregatedError;
  }

  /**
   * Returns a copy of the endpoint URLs used by the provider.
   */
  public getRpcEndpointUrls(): string[] {
    return this._rpcEndpoints.map(this._getRpcEndpointUrl);
  }

  private _getRpcEndpointUrl(rpcEndpoint: string | FetchRequest): string {
    if (typeof rpcEndpoint === 'string') {
      return rpcEndpoint;
    }

    return rpcEndpoint.url;
  }
}
