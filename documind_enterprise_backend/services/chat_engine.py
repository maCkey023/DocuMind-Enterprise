import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

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
    
    # FIX: Added similarity score threshold to drop completely irrelevant chunks!
    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": 4, "score_threshold": 0.5}
    )

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

    # 4. Setup The Guardrails (The Fix!)
    system_prompt = (
        "You are DocuMind, a strict enterprise data-extraction AI.\n"
        "WARNING: You are operating in a ZERO-TOLERANCE HALLUCINATION environment.\n\n"
        "CRITICAL RULES:\n"
        "1. You may ONLY answer using the information provided in the <context> block below. You are allowed to summarize and synthesize the context to answer the user's prompt.\n"
        "2. If the <context> block is empty, or if the user's question cannot be reasonably answered using the <context>, you MUST reply EXACTLY with: 'The provided document protocol does not contain specific information regarding this query.'\n"
        "3. NEVER use your outside general knowledge. NEVER apologize.\n\n"
        "<context>\n"
        "{context}\n"
        "</context>"
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