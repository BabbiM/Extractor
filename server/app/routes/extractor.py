from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
EXTRACTED_DIR = "data/extracted"
SCRAPED_VIDEOS_FILE = "data/scraped_videos.json"

def get_scraped_videos() -> set:
    """Get set of already scraped video IDs"""
    try:
        if os.path.exists(SCRAPED_VIDEOS_FILE):
            with open(SCRAPED_VIDEOS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logger.info(f"Loaded {len(data)} scraped videos from cache")
                return set(data) if isinstance(data, list) else set()
    except Exception as e:
        logger.error(f"Error loading scraped videos: {str(e)}")
    return set()

@router.get("/extract_channel")
async def extract_channel_comments(
    channel_url: str = Query(...),
    num_videos: int = Query(default=3),
    download: bool = Query(default=False)
):
    """Endpoint to extract comments from channel videos"""
    try:
        from app.utils.yt.dlp.extractor import extract_comments
        from app.utils.yt.dlp.video_list import get_videos_from_channel

        logger.info(f"Starting extraction for {channel_url}, {num_videos} videos")
        
        # Ensure directories exist
        Path(EXTRACTED_DIR).mkdir(parents=True, exist_ok=True)
        scraped_videos = get_scraped_videos()
        logger.info(f"Found {len(scraped_videos)} previously scraped videos")

        # Get videos from channel
        videos = get_videos_from_channel(channel_url, num_videos)
        logger.info(f"Retrieved {len(videos)} videos from channel")
        
        if not videos:
            logger.error("No videos found in channel")
            raise HTTPException(status_code=404, detail="No videos found in channel")

        analytics = {}
        csv_paths = []
        
        for i, video in enumerate(videos, 1):
            if len(analytics) >= num_videos:
                break
                
            video_url = video.get("url")
            if not video_url:
                logger.warning(f"Video {i} has no URL, skipping")
                continue

            video_id = video_url.split("v=")[-1].split("&")[0]
            if video_id in scraped_videos:
                logger.info(f"Skipping already scraped video: {video_id}")
                continue

            logger.info(f"Processing video {i}/{len(videos)}: {video_url}")
            
            # Extract comments with retries
            total_comments, comments = extract_comments(video_url)
            logger.info(f"Found {total_comments} comments for video {video_id}")

            if not comments:
                logger.info(f"No comments found for video {video_id}")
                continue

            # Save to CSV - fixed the f-string issue here
            csv_path = os.path.join(EXTRACTED_DIR, f"{video_id}.csv")
            try:
                with open(csv_path, 'w', encoding='utf-8') as f:
                    f.write("video_id,video_title,channel_url,comment_id,text,author,likes,timestamp\n")
                    for comment in comments:
                        text = comment.get("text", "").replace('"', "'")
                        f.write(
                            f'"{video_id}","{video.get("title", "Untitled")}",'
                            f'"{channel_url}","{comment.get("id", "")}",'
                            f'"{text}",'
                            f'"{comment.get("author", "")}",'
                            f'{comment.get("likes", 0)},'
                            f'"{comment.get("timestamp", "")}"\n'
                        )
                logger.info(f"Saved comments to {csv_path}")
            except Exception as e:
                logger.error(f"Failed to save CSV for {video_id}: {str(e)}")
                continue

            # Update analytics
            analytics[video_url] = {
                "title": video.get("title", "Untitled"),
                "total_comments": total_comments,
                "csv_path": csv_path
            }
            csv_paths.append(csv_path)

        if not analytics:
            logger.error("No comments extracted from any videos")
            raise HTTPException(status_code=404, detail="No comments found in any videos")

        logger.info(f"Successfully processed {len(analytics)} videos")
        
        if download and csv_paths:
            combined_csv = os.path.join(EXTRACTED_DIR, "combined_comments.csv")
            with open(combined_csv, 'w', encoding='utf-8') as outfile:
                outfile.write("video_id,video_title,channel_url,comment_id,text,author,likes,timestamp\n")
                for path in csv_paths:
                    with open(path, 'r', encoding='utf-8') as infile:
                        next(infile)  # Skip header
                        outfile.writelines(infile.readlines())
            logger.info(f"Created combined CSV at {combined_csv}")
            return FileResponse(combined_csv, filename="youtube_comments.csv")

        return {
            "analytics": analytics,
            "num_scraped_videos": len(analytics),
            "total_comments": sum(v["total_comments"] for v in analytics.values())
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Critical error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))