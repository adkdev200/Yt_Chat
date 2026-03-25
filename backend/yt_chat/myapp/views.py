from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .extractor import extract_video_and_transcript, extract_video_id
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings, ChatOllama
import json
from langchain.messages import HumanMessage, AIMessage, SystemMessage
from django.http import StreamingHttpResponse


embeddings = OllamaEmbeddings(model="qwen3-embedding:4b")

model = ChatOllama(model="qwen2.5:7b")
messages = [
    SystemMessage(content="You are a helpful assistant that answers questions based on the provided context."),]
id = None
@csrf_exempt
def link(request):
    global id
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method == 'POST':
        try:
            # Parse JSON body sent by Axios
            data = json.loads(request.body)
            url = data.get('url')
            id = extract_video_id(url)
            if not url:
                return JsonResponse({"error": "No URL provided"}, status=400)

            # Extract transcript
            extracted_text = extract_video_and_transcript(url)
            if not extracted_text:
                return JsonResponse({"error": "Failed to extract video or transcript"}, status=500)

            # Split text into chunks
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=300)
            chunks = text_splitter.split_text(extracted_text)

            # Create or load vector store
            vector_store = Chroma(
                collection_name = id,
                embedding_function=embeddings,
                persist_directory="./chroma_langchain_db",
            )

            vector_store.add_texts(chunks)
            

            # Return JSON response
            response = JsonResponse({"message": "Video and transcript extracted successfully!"})
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        except json.JSONDecodeError:
            response = JsonResponse({"error": "Invalid JSON"}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    response = JsonResponse({"error": "Invalid request method"}, status=405)
    response["Access-Control-Allow-Origin"] = "*"
    return response


@csrf_exempt
def chat(request):
    global id, messages
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("Received data:", data)
            query = data.get('query')
            print("Received query:", query)

            if not query:
                return JsonResponse({"error": "No query provided"}, status=400)

            if id is None:
                response = JsonResponse({"error": "No dataset loaded. Please submit a video link first."}, status=400)
                response["Access-Control-Allow-Origin"] = "*"
                return response

            # Perform similarity search
            vector_store = Chroma(
                collection_name = id,
                embedding_function=embeddings,
                persist_directory="./chroma_langchain_db",
            )

            results = vector_store.similarity_search(query, k=5)
            
            messages.append(HumanMessage(content=query + "\nContext:\n" + "\n\n".join([res.page_content for res in results])))
            
                
            



            stream_response = StreamingHttpResponse(generate_response(messages), content_type='text/plain')
            stream_response["Access-Control-Allow-Origin"] = "*"
            return stream_response


        except json.JSONDecodeError:
            response = JsonResponse({"error": "Invalid JSON"}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response

    response = JsonResponse({"error": "Invalid request method"}, status=405)
    response["Access-Control-Allow-Origin"] = "*"
    return response


@csrf_exempt
def generate_response(msgs):
    ai_response = ""
    for chunk in model.stream(msgs):
        text = chunk.content
        if isinstance(text, str):
            ai_response += text
            print(text)
            # yield to StreamingHttpResponse
            yield text
    # Append the completed AI message back to the global state
    messages.append(AIMessage(content=ai_response))