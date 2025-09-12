import { GraphQLClient } from 'graphql-request';

const METRICS_TO_DISPLAY: Record<string, string> = {
  GITHUB_commits_over_all_time: '1zNSDLeL7d1bqMgJ4b/AGBd0lQs4Q4Wy9jIf2ge72kw=',
  GITHUB_comments_over_all_time: 'd5VBo6xBRMwXq6CEm4KgX+NrdrU45HR1ryhhO9szl60=',
  GITHUB_opened_pull_requests_over_all_time: '4qXMv/x67zMwqoF6hmivpo74Y++R2lhT4Y9CjZKpt00=',
  GITHUB_contributors_over_all_time: 'Fx1VYZrsdL9HlxTjJKCyPpntx7ZdGAiW+L1TEnTZgSI=',
  GITHUB_merged_pull_requests_over_all_time: 'gKlMLwqOAY0NndkTeXiaN4XM8RqhEu9RGvYhZRLPPMM=',
  GITHUB_stars_over_all_time: 'Z6qQavpdhYhLZHxNqLlgWO8Fm1yU3jc3rdxehtP91Yc=',
  GITHUB_opened_issues_over_all_time: 'ftrYmCWeazkMzCpce018wYydj/HovL+5q25MGl+4uv0=',
  GITHUB_closed_issues_over_all_time: 'IBdxUvSrFquEY1PG3bYlD1LREqoRZxIHErDZDEAlM1M=',
  GITHUB_forks_over_all_time: 'OvHEN0B/pn82eKeV0jD9007tZriincUXAXgGqmYxPpc=',
};

export async function getRepoMetrics(ownerName: string, repoName: string, f = fetch) {
  const client = new GraphQLClient('https://www.opensource.observer/api/v1/graphql', {
    fetch: f,
  });

  const artifactIdQuery = `
    query GitHubArtifact {
      oso_artifactsByProjectV1(
        limit: 1,
        where: {
          artifactName: { _ilike: "${repoName}" },
          artifactNamespace: { _ilike: "${ownerName}" },
          projectSource: { _eq: "OSS_DIRECTORY" }
        }
      ) {
        artifactId
      }
    }
  `;

  const artifactIdResult = await client.request(artifactIdQuery, {});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const artifactId = (artifactIdResult as any).oso_artifactsByProjectV1[0]?.artifactId;

  const keyMetricsQuery = `
    query GetKeyMetrics {
      oso_keyMetricsByArtifactV0(where: {
        artifactId: {
          _eq: "${artifactId}"
        }
        
      }) {
        amount
        metricId
      }
    }
  `;

  const keyMetricsResult = await client.request(keyMetricsQuery, {});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keyMetrics = (keyMetricsResult as any).oso_keyMetricsByArtifactV0;

  const mappedResult = keyMetrics.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: Record<string, number>, metric: any) => {
      const metricName = Object.keys(METRICS_TO_DISPLAY).find(
        (key) => METRICS_TO_DISPLAY[key] === metric.metricId,
      );
      if (metricName) {
        acc[metricName] = Number(metric.amount);
      }
      return acc;
    },
    {},
  );

  return mappedResult;
}
