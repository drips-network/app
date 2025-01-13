import { fetchBlogPosts } from '../../../../../lib/utils/blog-posts';
import { createFetchProjectsParameters, fetchProjects } from './load-projects';

export default async function loadFilecoinExporePageData(f: typeof fetch) {
  const projectsParameters = createFetchProjectsParameters();

  const [blogPosts, projects] = await Promise.all([
    fetchBlogPosts(),
    fetchProjects(f, projectsParameters),
  ]);

  return {
    blogPosts,
    projects,
  };
}
