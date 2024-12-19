import type { JsonRpcApiProviderOptions, JsonRpcPayload, JsonRpcResult, Networkish } from 'ethers';
import { JsonRpcProvider, FetchRequest } from 'ethers';

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface FailoverJsonRpcProviderConfig {
  logger?: Logger;
}

/**
 * A `JsonRpcProvider` that transparently fails over to a list of backup JSON-RPC endpoints.
 */
export default class FailoverJsonRpcProvider extends JsonRpcProvider {
  private readonly _rpcEndpoints: (string | FetchRequest)[];
  private readonly _logger?: Logger;

  /**
   * @param rpcEndpoints - An array of JSON-RPC endpoints. The order determines the failover order.
   * @param network - Optional network configuration.
   * @param options - Optional provider options.
   * @param config - Optional configuration for the failover behavior.
   */
  constructor(
    rpcEndpoints: (string | FetchRequest)[],
    network?: Networkish,
    options?: JsonRpcApiProviderOptions,
    config: FailoverJsonRpcProviderConfig = {},
  ) {
    if (!rpcEndpoints.length) {
      throw new Error('At least one RPC endpoint is required.');
    }

    // Validate all endpoints.
    rpcEndpoints.forEach((endpoint, index) => {
      if (typeof endpoint === 'string') {
        try {
          new URL(endpoint);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          throw new Error(`Invalid URL at index ${index}: ${endpoint}.`);
        }
      } else if (!(endpoint instanceof FetchRequest)) {
        throw new Error(`Invalid endpoint type at index ${index}.`);
      }
    });

    super(rpcEndpoints[0], network, options);
    this._rpcEndpoints = rpcEndpoints;
    this._logger = config.logger;

    this._logger?.info(
      `Initializing FailoverJsonRpcProvider:\n` +
        `  Primary endpoint: ${this._getRpcEndpointUrl(rpcEndpoints[0])}\n` +
        `  Backup endpoints: ${
          rpcEndpoints
            .slice(1)
            .map((e) => this._getRpcEndpointUrl(e))
            .join(', ') || 'none'
        }\n`,
    );
  }

  /**
   * Overrides the `_send` method to try each endpoint until the request succeeds.
   *
   * While the actual request sending mechanism remains the same as the base class,
   * we create a new `FetchRequest` for each endpoint instead of using `_getConnection()`,
   * which would always return the primary (first) endpoint.
   *
   * @param payload - The JSON-RPC payload or array of payloads to send.
   * @returns A promise that resolves to the result of the first successful JSON-RPC call.
   */
  public override async _send(
    payload: JsonRpcPayload | Array<JsonRpcPayload>,
  ): Promise<Array<JsonRpcResult>> {
    const errors: { rpcEndpoint: string; error: Error }[] = [];

    // Try each endpoint, in order.
    for (const rpcEndpoint of this._rpcEndpoints) {
      const endpointUrl = this._getRpcEndpointUrl(rpcEndpoint);
      const startTime = Date.now();

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

        if (!response.ok) {
          throw new Error(`HTTP request failed with status ${response.statusCode}.`);
        }

        let resp = response.bodyJson;

        if (!Array.isArray(resp)) {
          resp = [resp];
        }

        // Check for RPC-level errors in the response.
        for (const item of resp) {
          if (item.error) {
            throw new Error(`RPC error: ${JSON.stringify(item.error)}.`);
          }
        }

        return resp;
      } catch (error) {
        const duration = Date.now() - startTime;
        const normalizedError = error instanceof Error ? error : new Error('Unknown error');

        this._logger?.warn(`RPC endpoint '${endpointUrl}' failed: ${normalizedError.message}`);

        errors.push({
          rpcEndpoint: endpointUrl,
          error: normalizedError,
        });

        // Log endpoint switch if there's a next endpoint to try.
        const currentIndex = this._rpcEndpoints.indexOf(rpcEndpoint);
        if (currentIndex < this._rpcEndpoints.length - 1) {
          const nextEndpoint = this._getRpcEndpointUrl(this._rpcEndpoints[currentIndex + 1]);
          this._logger?.warn(
            `Switching from ${endpointUrl} to ${nextEndpoint} (request took ${duration}ms).`,
          );
        }
      }
    }

    this._logger?.error(
      `Request failed after trying ${errors.length} endpoints. See error logs above for details.`,
    );
    throw new Error('All RPC endpoints failed.');
  }

  private _getRpcEndpointUrl(rpcEndpoint: string | FetchRequest): string {
    if (typeof rpcEndpoint === 'string') {
      return rpcEndpoint;
    }

    return rpcEndpoint.url;
  }
}
