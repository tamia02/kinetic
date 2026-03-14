export type ToolResponse = {
  result: any;
  error?: string;
};

export async function executeTool(tool: any, args: any): Promise<ToolResponse> {
  console.log(`[Tool Executor] Executing ${tool.name} with args:`, args);

  if (tool.type === "WEBHOOK" || tool.type === "N8N" || tool.type === "MAKE_COM") {
    const config = tool.config as { url: string; method?: string; headers?: Record<string, string> };
    
    if (!config.url) {
      return { result: null, error: "Missing Tool URL" };
    }

    try {
      const response = await fetch(config.url, {
        method: config.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: JSON.stringify(args),
      });

      const result = await response.json();
      return { result };
    } catch (err) {
      console.error(`[Tool Executor] Failed to execute ${tool.name}:`, err);
      return { result: null, error: String(err) };
    }
  }

  return { result: null, error: "Unsupported tool type" };
}
