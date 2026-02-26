import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore

# Load environment variables
load_dotenv()


def run_verification_test():
    print("Connecting to the DocuMind corporate brain...")

    # 1. Initialize the exact same embedding model we used to ingest the data
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    index_name = os.environ.get("PINECONE_INDEX_NAME")

    # 2. Connect to your existing Pinecone database
    vectorstore = PineconeVectorStore(
        index_name=index_name, embedding=embeddings)

    # 3. The official Week 1 Test Query
    query = "How do I get money back?"
    print(f"\nAsking the AI: '{query}'")
    print("Searching database...\n")

    # 4. Search the database for the most relevant chunk
    results = vectorstore.similarity_search(query, k=1)

    if results:
        print("--- 📄 RETRIEVED POLICY TEXT ---")
        print(results[0].page_content)
        print("--------------------------------")

        # Check if it successfully found the refund policy
        if "Refund Policy" in results[0].page_content:
            print("\n🎉 SUCCESS! Week 1 is officially complete.")
        else:
            print("\n⚠️ It retrieved text, but it wasn't the Refund Policy.")
    else:
        print("No results found.")


if __name__ == "__main__":
    run_verification_test()
