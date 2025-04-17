import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { IWorkflowEngineService } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/types";
import { upsertProductsToVectorWorkflowId } from "../../workflows/upsert-products-to-vector";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const scope = req.scope;

  const workflowEngineService = scope.resolve<IWorkflowEngineService>(
    Modules.WORKFLOW_ENGINE
  );
  const logger = scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  logger.info(
    `Received request to upsert products to vector DB. Triggering workflow '${upsertProductsToVectorWorkflowId}'...`
  );

  try {
    // Run the workflow asynchronously
    workflowEngineService.run(upsertProductsToVectorWorkflowId, {
      input: {},
      context: {},
      // throwOnError: false // Set to false if you don't want API errors if workflow fails immediately
    });

    // Return 202 Accepted immediately
    return res.status(202).json({
      message: `Workflow '${upsertProductsToVectorWorkflowId}' initiated successfully to upsert products to vector database.`,
      workflowId: upsertProductsToVectorWorkflowId,
    });
  } catch (error) {
    // Handle errors during workflow initiation
    logger.error(
      `Failed to initiate workflow '${upsertProductsToVectorWorkflowId}': ${error.message}`
    );
    return res.status(500).json({
      message: "Failed to initiate the vector upsert workflow.",
      error: error.message,
    });
  }
};
