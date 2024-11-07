import "dotenv/config";

import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";

/**
 *
 *                  +----> node2 -> END
 *  START -> node1
 *                 +----> node3 -> END
 *
 *
 */
async function main() {
  // State
  interface GraphState {
    text: string;
  }

  const graphStateChannels: StateGraphArgs<GraphState>["channels"] = {
    text: {
      value: (prevValue: string, newValue: string) => {
        return prevValue + newValue;
      },
    },
  };

  const node1 = () => {
    return {
      text: " I am",
    };
  };

  const node2 = () => {
    return {
      text: " sad!",
    };
  };

  const node3 = () => {
    return {
      text: " happy!",
    };
  };

  function decideMood(): "node2" | "node3" {
    return Math.random() > 0.5 ? "node2" : "node3";
  }

  const graphBuilder = new StateGraph({
    channels: graphStateChannels,
  }) // Add our nodes to the Graph
    .addNode("node1", node1)
    .addNode("node2", node2)
    .addNode("node3", node3)
    .addEdge(START, "node1")
    .addConditionalEdges("node1", decideMood)
    .addEdge("node2", END)
    .addEdge("node3", END);

  // Compile the Graph
  const graph = graphBuilder.compile();

  // Invoke the Graph
  const result = await graph.invoke({
    text: "",
  });
  console.log(result.text);
}

main().catch(console.error);
