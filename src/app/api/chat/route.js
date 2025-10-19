import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

export async function POST(req) {
  try {
    const { message } = await req.json();
    const VECTOR_DB_URL = process.env.QDRANT_URL;
    const VECTOR_DB_API_KEY = process.env.QDRANT_API_KEY;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing 'message' field" }),
        { status: 400 }
      );
    }

    const client = new OpenAI();

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });

    // Connect to existing Qdrant collection for local setup 
    // const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    //   url: "http://localhost:6333",
    //   collectionName: "robin-collection",
    // });


    // This used for the prodcution setup
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: VECTOR_DB_URL,
      apiKey: VECTOR_DB_API_KEY,
      collectionName: "robin-collection",
    });

    // Vector searcher for top 3 relevant chunks
    const vectorSearcher = vectorStore.asRetriever({
      k: 3,
    });

    // Retrieve relevant document chunks based on the user message
    const relevantChunks = await vectorSearcher.invoke(message);

    // Format context from retrieved chunks into system prompt


// In /app/api/rag/chat/route.js (snippet)
    const SYSTEM_PROMPT = `
    You are a retrieval‑grounded assistant that must answer ONLY from the Context and cite pages; if the Context is insufficient, reply “Insufficient context” and briefly say what is missing.

    Output Markdown in this exact structure:

    # Answer
    2–4 concise sentences grounded strictly in Context.

    ## Key points
    - 3–6 short bullets with facts referenced using [p:PAGE] where PAGE comes from context metadata.
    - No speculation; do not add information not present in Context.

    ## Explanation
    One or two short paragraphs that synthesize the relevant context; add code blocks or examples only if present in Context.

    ## Sources
    - One bullet per unique excerpt: “SOURCE_NAME — p.PAGE”.
    - If page or source is missing, display “p:N/A” or “SOURCE:N/A”.

    Rules:
    - Use only Context; never use external knowledge.
    - Quote numbers verbatim; summarize text succinctly.
    - Keep total output under ~400 tokens.

    Context:
    ${JSON.stringify(relevantChunks, null, 2)}
    `;

    // Chat completion call, latest message as 'user'
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    return new Response(
      JSON.stringify({ reply: response.choices[0].message.content }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500 }
    );
  }
}

