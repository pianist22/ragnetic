import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

export async function POST(req) {
  try {
    const VECTOR_DB_URL = process.env.QDRANT_URL;
    const VECTOR_DB_API_KEY = process.env.QDRANT_API_KEY;
    const formData = await req.formData();
    const file = formData.get("file");
    const inputText = formData.get("text");

    let loader;
    if (file) {
      loader = new PDFLoader(file);
    } else if (inputText) {
      loader = new TextLoader(inputText);
    } else {
      return new Response(JSON.stringify({ error: "No file or text provided" }), {
        status: 400,
      });
    }

    const docs = await loader.load();
    if (docs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No content found in document or text" }),
        { status: 400 }
      );
    }

    const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

    // Create or overwrite collection with new docs local setup for Docker localhost:6333
    // await QdrantVectorStore.fromDocuments(docs, embeddings, {
    //   url: "http://localhost:6333",
    //   collectionName: "robin-collection",
    //   // you may want to add collection config here
    // });

    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: VECTOR_DB_URL,
      apiKey: VECTOR_DB_API_KEY,
      collectionName: "robin-collection", // Your collection name
    });

    return new Response(
      JSON.stringify({ message: "Indexing performed successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Indexing error:", error);
    return new Response(
      JSON.stringify({ error: "Indexing failed", details: error.message }),
      { status: 500 }
    );
  }
}
