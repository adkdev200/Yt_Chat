from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma

vector_store = Chroma(
    collection_name="fluid_test_collection",
    embedding_function=OllamaEmbeddings(model="qwen3-embedding:4b"),
    persist_directory="../chroma_langchain_db",
) 


results = vector_store.similarity_search("cognitive research", k=5)
for i, res in enumerate(results):
    print(f"Chunk {i+1} (length {len(res.page_content)}): {res.page_content[:100]}...")

 