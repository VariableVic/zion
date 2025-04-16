import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { IWorkflowEngineService } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/types";
import { generateProductsWorkflowId } from "../../workflows/generate-products";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const scope = req.scope;

  const workflowEngineService = scope.resolve<IWorkflowEngineService>(
    Modules.WORKFLOW_ENGINE
  );
  const logger = scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

  // Extract count from query parameters, default to 10
  const count = (req.query.count as string) || "10";

  logger.info(
    `Received request to generate ${count} products. Triggering workflow '${generateProductsWorkflowId}'...`
  );

  try {
    // Run the workflow asynchronously
    // We don't await the run call itself, allowing the request to return quickly.
    // Error handling for the workflow execution itself happens within the workflow engine.
    workflowEngineService.run(generateProductsWorkflowId, {
      input: { count },
      context: {
        // Pass necessary context if needed, e.g., user ID
        // logger: logger // Can pass logger if workflow needs it explicitly
      },
      // throwOnError: false // Set to false if you don't want API errors if workflow fails immediately
    });

    // Return 202 Accepted immediately
    return res.status(202).json({
      message: `Workflow '${generateProductsWorkflowId}' initiated successfully to generate ${count} products.`,
      workflowId: generateProductsWorkflowId,
    });
  } catch (error) {
    // This catch block handles errors during the *initiation* of the workflow (e.g., invalid workflowId)
    // not errors during the workflow's execution.
    logger.error(
      `Failed to initiate workflow '${generateProductsWorkflowId}': ${error.message}`
    );
    return res.status(500).json({
      message: "Failed to initiate the product generation workflow.",
      error: error.message,
    });
  }
};
