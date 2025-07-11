from yt_dlp import YoutubeDL
import logging
from typing import Tuple, List, Dict

logger = logging.getLogger(__name__)

def extract_comments(video_url: str) -> Tuple[int, List[Dict]]:
    """Enhanced with validation and logging"""
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'extract_flat': False,
        'getcomments': True,
        'extractor_args': {
            'youtube': {
                'max_comments': ['all'],
                'comment_sort': ['top']
            }
        }
    }

    try:
        logger.info(f"Extracting comments from {video_url}")
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            if not info or 'comments' not in info:
                logger.warning("No comments found in video info")
                return 0, []
            
            comments = []
            for comment in info['comments']:
                if not comment:
                    continue
                    
                comments.append({
                    'id': comment.get('id', ''),
                    'text': comment.get('text', '')[:2000].replace('"', "'"),
                    'author': comment.get('author', ''),
                    'likes': comment.get('like_count', 0),
                    'timestamp': comment.get('timestamp', '')
                })
            
            logger.info(f"Extracted {len(comments)} valid comments")
            return len(comments), comments

    except Exception as e:
        logger.error(f"Comment extraction failed: {str(e)}", exc_info=True)
        return 0, []