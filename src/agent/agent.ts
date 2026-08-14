
import OpenAI from "openai";
import { openai } from "../lib/llm";
import { getSystemPrompt } from "./prompts";
import { toolDefinitions, executeTool } from "./toolRegistry";
import { AgentLog } from "../models/AgentLog";
import { generateSessionId } from "../lib/utils";

const MAX_ITERATIONS = 10;

export interface AgentResponse {
  sessionId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  success: boolean;
  error?: string;
}

export async function runAgent(
  userMessage: string,
  customerEmail?: string
): Promise<AgentResponse> {
  const sessionId = generateSessionId();

  console.log("\n========================================");
  console.log("🤖 AGENT STARTED");
  console.log("Session:", sessionId);
  console.log("Message:", userMessage);
  console.log("Customer Email:", customerEmail || "Not provided");
  console.log("========================================");

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: getSystemPrompt(),
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    await AgentLog.create({
      sessionId,
      type: "REQUEST_RECEIVED",
      input: {
        message: userMessage,
        customerEmail,
      },
      status: "COMPLETED",
    });

    let iteration = 0;

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      console.log(`\n🔄 ITERATION ${iteration}/${MAX_ITERATIONS}`);

      // --------------------------------------------------
      // DEBUG: OpenAI configuration
      // --------------------------------------------------

      console.log("🔵 Calling OpenAI...");
      console.log("Model: gpt-4o-mini");
      console.log("Messages:", messages.length);
      console.log(
        "Tools:",
        toolDefinitions.map((tool) => tool.function.name)
      );

      // --------------------------------------------------
      // OpenAI request
      // --------------------------------------------------

      let response;

      try {
        response = await openai.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          tools: toolDefinitions,
          tool_choice: "auto",
        });

        console.log("🟢 OpenAI response received");
      } catch (error) {
        console.error("\n🔴 OPENAI CALL FAILED");

        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        } else {
          console.error("Unknown error:", error);
        }

        throw error;
      }

      // --------------------------------------------------
      // DEBUG: OpenAI response
      // --------------------------------------------------

      console.log("Response ID:", response.id);
      console.log("Choices:", response.choices.length);
      console.log(
        "Finish reason:",
        response.choices[0]?.finish_reason
      );

      const assistantMessage = response.choices[0]?.message;

      if (!assistantMessage) {
        throw new Error("No response received from OpenAI");
      }

      console.log(
        "Assistant content:",
        assistantMessage.content || "(no text)"
      );

      console.log(
        "Tool calls:",
        assistantMessage.tool_calls?.length || 0
      );

      messages.push(assistantMessage);

      // --------------------------------------------------
      // Tool calls
      // --------------------------------------------------

      if (
        assistantMessage.tool_calls &&
        assistantMessage.tool_calls.length > 0
      ) {
        console.log("\n🛠️ TOOL CALLS DETECTED");

        await AgentLog.create({
          sessionId,
          type: "INTENT_IDENTIFIED",
          output: {
            tools: assistantMessage.tool_calls.map(
              (toolCall) => toolCall.function.name
            ),
          },
          status: "COMPLETED",
        });

        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;

          console.log(`\n🔧 Executing tool: ${toolName}`);

          let toolArgs: Record<string, unknown>;

          try {
            toolArgs = JSON.parse(toolCall.function.arguments);

            console.log("Tool arguments:", toolArgs);
          } catch (error) {
            console.error(
              "❌ Failed to parse tool arguments:",
              toolCall.function.arguments
            );

            toolArgs = {};
          }

          try {
            const toolResult = await executeTool(
              toolName,
              toolArgs,
              sessionId
            );

            console.log("🟢 Tool result:", toolResult);

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Tool execution failed";

            console.error(`🔴 Tool failed: ${toolName}`);
            console.error("Error:", errorMessage);

            await AgentLog.create({
              sessionId,
              type: "ERROR",
              tool: toolName,
              input: toolArgs,
              output: {
                error: errorMessage,
              },
              status: "FAILED",
            });

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                success: false,
                error: errorMessage,
              }),
            });
          }
        }

        console.log("➡️ Sending tool results back to OpenAI...");

        continue;
      }

      // --------------------------------------------------
      // Final response
      // --------------------------------------------------

      const finalResponse =
        assistantMessage.content ||
        "I couldn't process your request. Please try again.";

      console.log("\n✅ FINAL AGENT RESPONSE:");
      console.log(finalResponse);

      await AgentLog.create({
        sessionId,
        type: "AGENT_RESPONSE",
        output: {
          response: finalResponse,
        },
        status: "COMPLETED",
      });

      return {
        sessionId,
        messages: messages
          .filter(
            (message) =>
              message.role === "user" ||
              message.role === "assistant"
          )
          .map((message) => ({
            role: message.role as "user" | "assistant",
            content:
              typeof message.content === "string"
                ? message.content
                : "",
          })),
        success: true,
      };
    }

    console.error("🔴 MAXIMUM ITERATIONS REACHED");

    await AgentLog.create({
      sessionId,
      type: "ERROR",
      output: {
        error: "Maximum agent iterations reached",
      },
      status: "FAILED",
    });

    return {
      sessionId,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      success: false,
      error: "Unable to process the request.",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected agent error";

    console.error("\n========================================");
    console.error("🔴 AGENT FAILED");
    console.error("Session:", sessionId);
    console.error("Error:", errorMessage);
    console.error("========================================\n");

    await AgentLog.create({
      sessionId,
      type: "ERROR",
      output: {
        error: errorMessage,
      },
      status: "FAILED",
    });

    return {
      sessionId,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      success: false,
      error: errorMessage,
    };
  }
}