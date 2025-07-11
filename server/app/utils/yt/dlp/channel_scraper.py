from .extractor import extract_comments
from .video_list import get_videos_from_channel
import os
import time
import json
from pathlib import Path
from typing import Tuple, Dict, List

EXTRACTED_DIR = "data/extracted"
SCRAPED_VIDEOS_FILE = "data/scraped_videos.json"

def get_scraped_videos() -> set:
    """Get set of already scraped video IDs with enhanced error handling"""
    try:
        if os.path.exists(SCRAPED_VIDEOS_FILE):
            with open(SCRAPED_VIDEOS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return set(data)
                return set()
    except Exception as e:
        print(f"⚠️ Error loading scraped videos: {str(e)}")
    return set()

def save_scraped_video(video_id: str):
    """Save scraped video ID with atomic write"""
    try:
        scraped = get_scraped_videos()
        scraped.add(video_id)
        Path("data").mkdir(parents=True, exist_ok=True)
        temp_file = f"{SCRAPED_VIDEOS_FILE}.tmp"
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(list(scraped), f, ensure_ascii=False)
        os.replace(temp_file, SCRAPED_VIDEOS_FILE)
    except Exception as e:
        print(f"⚠️ Error saving scraped video: {str(e)}")

def extract_channel_comments(channel_url: str, num_videos: int) -> Tuple[Dict, str]:
    """
    Robust channel comment extraction with:
    - Guaranteed video processing count
    - Comprehensive error handling
    - Detailed progress reporting
    """
    Path(EXTRACTED_DIR).mkdir(parents=True, exist_ok=True)
    scraped_videos = get_scraped_videos()
    
    print(f"\n🔍 Starting extraction for: {channel_url}")
    print(f"📊 Requested videos: {num_videos}")
    print(f"📋 Already scraped videos: {len(scraped_videos)}")

    try:
        # Get 2x requested videos to account for already scraped ones
        videos = get_videos_from_channel(channel_url, num_videos * 2)
        if not videos:
            raise ValueError("❌ No videos found in channel")
        
        analytics = {}
        csv_paths = []
        processed_count = 0
        video_count = 0
        
        for video in videos:
            if processed_count >= num_videos:
                break
                
            video_url = video.get("url")
            if not video_url:
                continue
                
            video_id = video_url.split("v=")[-1].split("&")[0]
            video_count += 1
            
            if video_id in scraped_videos:
                print(f"⏭️ Skipping already scraped video ({video_count}/{len(videos)}): {video_url}")
                continue
                
            print(f"\n⚙️ Processing video {processed_count + 1}/{num_videos} ({video_count}/{len(videos)})")
            print(f"📌 Title: {video.get('title', 'Untitled')}")
            print(f"🔗 URL: {video_url}")
            
            for attempt in range(1, 4):
                try:
                    print(f"🔄 Attempt {attempt}/3: Extracting comments...")
                    total_comments, comments = extract_comments(video_url)
                    
                    if not comments:
                        print("ℹ️ No comments found in this video")
                        save_scraped_video(video_id)
                        break
                        
                    csv_path = os.path.join(EXTRACTED_DIR, f"{video_id}.csv")
                    print(f"💾 Saving {total_comments} comments to {csv_path}")
                    
                    # Write comments to CSV
                    with open(csv_path, 'w', encoding='utf-8') as f:
                        f.write("comment_id,text,author,likes,timestamp\n")
                        for comment in comments:
                            f.write(f"{comment['id']},\"{comment['text']}\",{comment['author']},{comment['likes']},{comment['timestamp']}\n")
                    
                    # Update analytics
                    analytics[video_url] = {
                        "title": video.get("title", "Untitled"),
                        "total_comments": total_comments,
                        "csv_path": csv_path,
                        "upload_date": video.get("upload_date", "N/A")
                    }
                    csv_paths.append(csv_path)
                    save_scraped_video(video_id)
                    processed_count += 1
                    print(f"✅ Successfully processed video {processed_count}/{num_videos}")
                    break
                    
                except Exception as e:
                    print(f"⚠️ Attempt {attempt} failed: {str(e)}")
                    if attempt == 3:
                        print(f"❌ Failed to process video after 3 attempts")
                    time.sleep(2 ** attempt)  # Exponential backoff

        if not analytics:
            print("\n🔴 No comments extracted from any videos")
            print("Possible reasons:")
            print("- All fetched videos were already scraped")
            print("- Videos have no comments (check manually)")
            print("- YouTube is blocking requests (try different network)")
            print("- Channel URL format is incorrect")
            return {}, ""
            
        print(f"\n🟢 Successfully processed {len(analytics)}/{num_videos} videos")
        print(f"📝 Total comments extracted: {sum(v['total_comments'] for v in analytics.values())}")
        return analytics, csv_paths[-1] if csv_paths else ""
        
    except Exception as e:
        print(f"\n❌ Critical error: {str(e)}")
        raise