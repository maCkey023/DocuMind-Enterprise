
import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# Load the API keys (.env)
load_dotenv()

def build_chat_chain():
    # 1. Connect to Pinecone (Your Brain's Memory)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    index_name = os.environ.get("PINECONE_INDEX_NAME")
    
    # UPDATE: Added the namespace where your new data lives!
    vectorstore = PineconeVectorStore(
        index_name=index_name, 
        embedding=embeddings,
        namespace="corporate-policies-v1" 
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

    # 2. Connect to Groq/Llama-3 (Your Brain's Voice)
    llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0)

    # 3. Setup Memory (History-Aware Retrieval)
    contextualize_q_system_prompt = (
        "Given a chat history and the latest user question "
        "which might reference context in the chat history, "
        "formulate a standalone question which can be understood "
        "without the chat history. Do NOT answer the question, "
        "just reformulate it if needed and otherwise return it as is."
    )
    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)

    # 4. Setup The Guardrails (Strict System Prompt)
    system_prompt = (
        "You are a strict, enterprise corporate assistant for DocuMind. "
        "You must answer questions SOLELY based on the provided context below. "
        "If the answer is not contained within the context, you MUST say exactly: "
        "'I don't know' or 'This is outside my scope.' "
        "Do NOT invent, guess, or use outside knowledge. "
        "\n\nContext:\n{context}"
    )
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

    # 5. Combine everything into one powerful AI Chain
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
    return rag_chain