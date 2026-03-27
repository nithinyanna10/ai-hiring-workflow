import { workflowStages } from "@hiring-workflow/shared";

export function isKnownWorkflowStage(value: string) {
  return workflowStages.includes(value as (typeof workflowStages)[number]);
}
