import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SalesOperationsDashboard,
  SalesOpportunity,
  SalesOpportunityUpdate
} from "./salesOperations";

export async function getSalesOperationsDashboard(client: SupabaseClient) {
  const { data, error } = await client.rpc("sales_operations_dashboard");

  return {
    dashboard: data ? (data as SalesOperationsDashboard) : null,
    error
  };
}

export async function getSalesOpportunity(client: SupabaseClient, intakeId: string) {
  const { data, error } = await client.rpc("get_sales_opportunity", {
    p_intake_id: intakeId
  });

  return {
    opportunity: data ? (data as SalesOpportunity) : null,
    error
  };
}

export async function updateSalesOpportunity(
  client: SupabaseClient,
  intakeId: string,
  update: SalesOpportunityUpdate
) {
  const { data, error } = await client.rpc("update_sales_opportunity", {
    p_intake_id: intakeId,
    p_pipeline_stage: update.pipelineStage,
    p_assigned_owner: update.assignedOwner,
    p_next_action: update.nextAction
  });

  return {
    opportunity: data ? (data as SalesOpportunity) : null,
    error
  };
}

export async function recordSalesProposalDownload(client: SupabaseClient, intakeId: string) {
  return client.rpc("record_sales_proposal_download", {
    p_intake_id: intakeId
  });
}

export async function recordSalesCrmSync(
  client: SupabaseClient,
  intakeId: string,
  status: "synced" | "failed" | "not-configured",
  detail: string
) {
  return client.rpc("record_sales_crm_sync", {
    p_intake_id: intakeId,
    p_sync_status: status,
    p_sync_detail: detail
  });
}
