import sys
import re
import os
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv
import pymongo

# Load environment variables
load_dotenv()

# MongoDB connection
try:
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["taskii_db"]  # Your database name
    videos_collection = db["videos"]  # Collection for video data
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    sys.exit(1)

def extract_video_id(url):
    """Extract the video ID from the YouTube URL."""
    match = re.search(r"v=([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    else:
        raise ValueError("Invalid YouTube URL")

def extract_metadata(url):
    """Extract the video title and channel name from the YouTube page."""
    try:
        r = requests.get(url)
        soup = BeautifulSoup(r.text, features="html.parser")

        # Extract title
        title_tag = soup.find_all(name="title")[0]
        title = title_tag.get_text()

        # Extract channel name
        link_channel = soup.find("link", itemprop="name")
        channel = link_channel['content'] if link_channel else "Unknown Channel"

        return title, channel
    except Exception as e:
        print(f"Error extracting metadata: {e}")
        return None, None

def download_thumbnail(video_id, save_dir):
    """Download and save the video thumbnail."""
    try:
        image_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
        img_data = requests.get(image_url).content

        # Ensure the directory exists
        os.makedirs(save_dir, exist_ok=True)

        thumbnail_path = os.path.join(save_dir, f"{video_id}_thumbnail.jpg")
        with open(thumbnail_path, 'wb') as handler:
            handler.write(img_data)
        return thumbnail_path
    except Exception as e:
        print(f"Error downloading thumbnail: {e}")
        return None

def get_transcript(video_id):
    """Fetch the transcript for the video."""
    try:
        transcript_raw = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'es', 'ko'])
        transcript_str_lst = [i['text'] for i in transcript_raw]
        return ' '.join(transcript_str_lst)
    except Exception as e:
        print(f"Error fetching transcript: {e}")
        return None

def save_to_mongo(title, channel, video_id, thumbnail_path, transcript):
    """Save video data to MongoDB."""
    try:
        video_data = {
            "title": title,
            "channel": channel,
            "video_id": video_id,
            "thumbnail_path": thumbnail_path,
            "transcript": transcript
        }
        videos_collection.insert_one(video_data)
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script_name.py <youtube_url>")
        sys.exit(1)

    youtube_url = sys.argv[1]

    try:
        video_id = extract_video_id(youtube_url)
        title, channel = extract_metadata(youtube_url)
        static_dir = 'C:/Users/Furnom Dam/Taskii/static'

        # Step 1: Download thumbnail
        thumbnail_path = download_thumbnail(video_id, static_dir)

        # Step 2: Get transcript
        transcript = get_transcript(video_id)

        # Step 3: Save data to MongoDB
        save_to_mongo(title, channel, video_id, thumbnail_path, transcript)

        # Print output
        print(f"Title: {title}")
        print(f"Channel: {channel}")
        print(f"Thumbnail saved to: {thumbnail_path}")
        print(f"Transcript: {transcript if transcript else 'No transcript available'}")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
