const accessOptionalEnvVar = vi.fn((env: Record<string, string>, varName: string) => env[varName]);

export default accessOptionalEnvVar;
