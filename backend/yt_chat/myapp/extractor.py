from youtube_transcript_api import YouTubeTranscriptApi
import re

def extract_video_and_transcript(url):
    # Extract video ID from URL
    video_id = extract_video_id(url)
    
    if not video_id:
        return None
    
    try:
        print(f"Extracted video ID: {video_id}")
        # Get transcript for the video
        yttapi = YouTubeTranscriptApi()
        fetched_transcript = yttapi.fetch(video_id)
        final_transcript = " ".join([snippet.text for snippet in fetched_transcript])
        return final_transcript
    except Exception as e:
        print(f"Error extracting transcript: {e}")
        return None
    

from urllib.parse import urlparse, parse_qs

def extract_video_id(url: str) -> str | None:
    parsed = urlparse(url)

    # Case 1: youtu.be/<id>
    if parsed.hostname == "youtu.be":
        return parsed.path[1:]

    # Case 2: youtube.com/watch?v=<id>
    if parsed.hostname in ("www.youtube.com", "youtube.com"):
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [None])[0]

        # Case 3: /embed/<id> or /shorts/<id>
        if parsed.path.startswith(("/embed/", "/shorts/")):
            return parsed.path.split("/")[2]

    return None


