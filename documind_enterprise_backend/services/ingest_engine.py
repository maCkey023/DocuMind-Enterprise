import os
import logging
from dotenv import load_dotenv
# 1. CHANGED: Import UnstructuredPDFLoader as mandated by the project memo
from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from pinecone import Pinecone

# 1. Setup Logging (Replaces basic print statements)
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load Environment Variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "documind-local"  # Change this to your actual Pinecone index name
NAMESPACE = "corporate-policies-v1"


def ingest_document(file_path: str = "./data/corporate_policy.pdf"):
    try:
        # 2. Initialize Pinecone & Embeddings
        logger.info("Initializing Pinecone and HuggingFace Embeddings...")
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(INDEX_NAME)

        # Using the free, local fallback model approved in the memo
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # 3. Load PDF and Extract Metadata using Unstructured
        logger.info(f"Loading document: {file_path}")

        # THE FIX 1: Changed to mode="paged" to keep the pages separated!
        loader = UnstructuredPDFLoader(file_path, mode="paged")
        documents = loader.load()
        logger.info(f"Successfully loaded {len(documents)} pages.")

        # 4. PRE-PROCESSING: Inject page numbers into the text content
        for doc in documents:
            page_num = doc.metadata.get("page_number", "Unknown")
            # We add a header to the text so the AI knows exactly which page it's reading
            doc.page_content = f"--- SOURCE: PAGE {page_num} ---\n{doc.page_content}"


        # 4. Advanced Chunking Strategy
        logger.info("Chunking text to preserve context...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150,
            length_function=len
        )
        chunks = text_splitter.split_documents(documents)
        logger.info(f"Split document into {len(chunks)} chunks.")

        # 5. Batch Processing for Pinecone Upload
        batch_size = 100
        vectors_to_upsert = []

        logger.info("Generating embeddings and uploading in batches...")
        for i, chunk in enumerate(chunks):
            # Generate the vector embedding locally
            vector = embeddings.embed_query(chunk.page_content)

            # THE FIX 2: Unstructured uses "page_number" instead of "page". We check both just to be safe.
            page_num = chunk.metadata.get(
                "page_number", chunk.metadata.get("page", 1))

            # Prepare the payload with critical metadata
            vector_id = f"chunk-{i}"
            metadata = {
                "text": chunk.page_content,
                "source": chunk.metadata.get("source", "Unknown"),
                "page": page_num
            }

            vectors_to_upsert.append((vector_id, vector, metadata))

            # Upload when batch is full
            if len(vectors_to_upsert) >= batch_size:
                index.upsert(vectors=vectors_to_upsert, namespace=NAMESPACE)
                vectors_to_upsert = []  # Reset batch
                logger.info(f"Upserted batch of {batch_size} chunks.")

        # Upload any remaining chunks
        if vectors_to_upsert:
            index.upsert(vectors=vectors_to_upsert, namespace=NAMESPACE)
            logger.info(
                f"Upserted final batch of {len(vectors_to_upsert)} chunks.")

        logger.info("✅ Ingestion completely successfully!")

    except Exception as e:
        logger.error(f"❌ Ingestion failed: {str(e)}")


if __name__ == "__main__":
    ingest_document()
