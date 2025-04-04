import os
import shutil
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
from werkzeug.utils import secure_filename
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from mistralai import Mistral
# from florenceCaptioning import generateVideoCaptionCorpus

app = Flask(__name__)
CORS(app)

DATA_DIR = "data/documents"
FOOTAGE_DIR = "data/footages"
CHROMA_DB_DIR = "./chroma_db"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(FOOTAGE_DIR, exist_ok=True)

mistral_client = Mistral(api_key=os.environ.get("MISTRAL_API_KEY"))
MODEL_NAME = "mistral-large-latest"

def update_vector_store(place):
    """ Updates ChromaDB with the new document data from the specified place. """
    file_path = os.path.join(DATA_DIR, f"{place}.txt")
    if not os.path.exists(file_path):
        return {"error": "File not found"}, 400
    
    try:
        embeddings = OllamaEmbeddings(model="nomic-embed-text")
        vector_store = Chroma(embedding_function=embeddings, persist_directory=CHROMA_DB_DIR)
        vector_store.delete_collection()  
        del vector_store  
    except Exception as e:
        print(f"Warning: Could not release ChromaDB before deletion: {str(e)}")
    
    import time
    time.sleep(2)  
    
    if os.path.exists(CHROMA_DB_DIR):
        shutil.rmtree(CHROMA_DB_DIR, ignore_errors=True)
    os.makedirs(CHROMA_DB_DIR, exist_ok=True)

    loader = TextLoader(file_path)
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=150)
    splits = text_splitter.split_documents(documents)
    
    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=CHROMA_DB_DIR)
    
    return {"message": "store updated"}, 200


def get_response_from_mistral(query):
    """ Fetches relevant context from ChromaDB and queries Mistral LLM. """
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    
    try:
        vector_store = Chroma(embedding_function=embeddings, persist_directory=CHROMA_DB_DIR)
        retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 6})
        
        relevant_docs = retriever.invoke(query)
        context = "\n".join([doc.page_content for doc in relevant_docs])
        
        system_prompt = (
            "You are ZenSafe Bot, an AI assistant designed to aid law enforcement in evidence retrieval from CCTV footage. "
            "You are provided with textual descriptions of CCTV footage, captured at one-second intervals. "
            "Law enforcement officers will query this data to gather evidence related to crimes. "
        )
        
        human_prompt = f"""
        Context:
        {context}
        
        Question: {query}
        
        Provide a precise and detailed response based on the context above.
        """
        
        chat_response = mistral_client.chat.complete(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": human_prompt}
            ]
        )
        
        return {"response": chat_response.choices[0].message.content, "retrieved_documents": context}, 200
    
    except Exception as e:
        return {"error": str(e)}, 500
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5010, debug=True)
