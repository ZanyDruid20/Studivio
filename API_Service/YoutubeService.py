import sys
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
import pymongo

# MongoDB connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["taskii_db"]
videos_collection = db["videos"]

def extract_metadata(url):
    """Extract the video title and channel name."""
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")
    
    title = soup.find("title").get_text()
    channel = soup.find("link", itemprop="name")["content"] if soup.find("link", itemprop="name") else "Unknown Channel"
    
    return title, channel

def download_thumbnail(video_id):
    """Download the thumbnail image."""
    image_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
    img_data = requests.get(image_url).content
    thumbnail_path = f"{video_id}_thumbnail.jpg"
    
    with open(thumbnail_path, 'wb') as handler:
        handler.write(img_data)
    
    return thumbnail_path

def get_transcript(video_id):
    """Fetch the transcript."""
    try:
        transcript_raw = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        transcript_str_lst = [entry['text'] for entry in transcript_raw]
        return ' '.join(transcript_str_lst)
    except:
        return None

def save_to_mongo(title, channel, video_id, thumbnail_path, transcript):
    """Save video data to MongoDB."""
    video_data = {
        "title": title,
        "channel": channel,
        "video_id": video_id,
        "thumbnail_path": thumbnail_path,
        "transcript": transcript
    }
    videos_collection.insert_one(video_data)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script_name.py <youtube_url>")
        sys.exit(1)

    youtube_url = sys.argv[1]

    video_id = youtube_url.split("=")[1]  # Extract video ID from URL
    title, channel = extract_metadata(youtube_url)
    thumbnail_path = download_thumbnail(video_id)
    transcript = get_transcript(video_id)

    save_to_mongo(title, channel, video_id, thumbnail_path, transcript)

    print(f"Title: {title}")
    print(f"Channel: {channel}")
    print(f"Thumbnail saved to: {thumbnail_path}")
    print(f"Transcript: {transcript if transcript else 'No transcript available'}")
