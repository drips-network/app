import { error } from '@sveltejs/kit';

export const load = async ({ parent, params, fetch }) => {
  const { applicationForms } = await parent();

  const form = applicationForms.find((form) => form.id === params.formId)

  if (!form) {
    throw error(404, 'Form not found');
  }

  return {
    form,
  };
};
