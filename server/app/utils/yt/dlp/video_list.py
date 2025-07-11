from yt_dlp import YoutubeDL
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

def get_videos_from_channel(channel_url: str, num_videos: int) -> List[Dict]:
    """Enhanced with detailed logging"""
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'playlistend': num_videos,
        'extractor_args': {
            'youtube': {'skip': ['dash', 'hls']}
        }
    }

    if not channel_url.endswith('/videos'):
        channel_url = channel_url.rstrip('/') + '/videos'
        logger.info(f"Modified channel URL to videos tab: {channel_url}")

    try:
        with YoutubeDL(ydl_opts) as ydl:
            logger.info(f"Fetching videos from {channel_url}")
            info = ydl.extract_info(channel_url, download=False)
            
            if not info or 'entries' not in info:
                logger.error("No video entries found in channel info")
                return []
            
            videos = []
            for entry in info['entries'][:num_videos]:
                if not entry.get('id'):
                    continue
                    
                videos.append({
                    "title": entry.get('title', 'Untitled'),
                    "url": f"https://youtube.com/watch?v={entry['id']}",
                    "upload_date": entry.get('upload_date', '')
                })
            
            logger.info(f"Found {len(videos)} videos")
            return videos

    except Exception as e:
        logger.error(f"Failed to get videos: {str(e)}", exc_info=True)
        return []