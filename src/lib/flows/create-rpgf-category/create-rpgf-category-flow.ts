import { makeStep } from "$lib/components/stepper/types";
import type { ApplicationCategory, ApplicationForm } from "$lib/utils/rpgf/types/application";
import EnterCategoryDetails from "./enter-category-details.svelte";

export default (roundId: string, existingCategories: ApplicationCategory[], existingApplicationForms: ApplicationForm[]) => {
  return {
    steps: [
      makeStep({
        component: EnterCategoryDetails,
        props: {
          roundId,
          existingCategories,
          existingApplicationForms,
        }
      })
    ]
  }
}
