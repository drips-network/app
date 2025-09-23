import { makeStep } from "$lib/components/stepper/types";
import EnterFormDetails from "./enter-form-details.svelte";

export default (roundId: string) => {
  return {
    steps: [
      makeStep({
        component: EnterFormDetails,
        props: {
          roundId,
        }
      })
    ]
  }
}
