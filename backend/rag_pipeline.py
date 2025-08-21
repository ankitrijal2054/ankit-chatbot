from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

from config import get_settings

settings = get_settings()

class RAGPipeline:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.google_api_key,
            convert_system_message_to_human=True
        )

        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.embeddings_model_name
        )

        self.vectorstore = Chroma(
            persist_directory=settings.persist_directory,
            embedding_function=self.embeddings
        )

        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

        self.qa_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vectorstore.as_retriever(),
            memory=self.memory,
            chain_type="stuff",
            combine_docs_chain_kwargs={"prompt": self._get_custom_prompt()}
        )

    def _get_custom_prompt(self):
        prompt_template = """
You are Jarvis, a personal assistant chatbot designed to answer questions about Ankit.

You should:
- Politely respond to casual greetings (e.g., "hey", "how are you?")
- Provide accurate and helpful answers to questions about Ankit using the provided context
- Decline to answer questions not related to Ankit or the chatbot itself by saying something like:
  "I'm only trained to answer questions about Ankit. Please ask something related to him."

Never make up answers, and do not speculate.

Context:
{context}

Question:
{question}

Answer:
"""

        return PromptTemplate(
            input_variables=["context", "question"],
            template=prompt_template
        )

    def generate_response(self, query: str):
        result = self.qa_chain.invoke({"question": query})
        return {
            "response": result["answer"],
            "confidence": "high"  # Optional — remove if unused
        }

    def clear_memory(self):
        self.memory.clear()

_rag_instance = None

def get_rag_pipeline():
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGPipeline()
    return _rag_instance