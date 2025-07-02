import os
import csv
from datetime import datetime
from typing import Tuple, List, Dict
from yt_dlp import YoutubeDL

def extract_comments(video_url: str) -> Tuple[int, List[Dict]]:
    """
    Extracts YouTube comments and saves to CSV without DataFrame dependencies.
    Returns:
        Tuple of (comment_count, comments_list) where comments_list contains flattened dictionaries
    """
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'getcomments': True,
        'extractor_args': {
            'youtube': {
                'max_comments': ['100'],
                'comment_sort': ['top']
            }
        },
        'sleep_interval': 2,
        'ignoreerrors': True,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            raw_comments = info.get('comments', [])
            
            # Flatten comment structure for better compatibility
            comments = []
            for comment in raw_comments:
                comments.append({
                    'comment_id': comment.get('id'),
                    'text': clean_text(comment.get('text', '')),
                    'likes': comment.get('like_count', 0),
                    'author': comment.get('author'),
                    'author_id': comment.get('author_id'),
                    'timestamp': comment.get('timestamp'),
                    'time_text': comment.get('_time_text', ''),
                    'is_pinned': comment.get('is_pinned', False)
                })
            
            if comments:
                csv_path = export_comments_to_csv(comments, video_url)
                print(f"Comments exported to {csv_path}")
            
            return len(comments), comments

    except Exception as e:
        print(f"Error in extract_comments: {str(e)}")
        return 0, []

def clean_text(text: str) -> str:
    """Clean comment text for CSV output"""
    return text.replace('\n', ' ').replace('\r', ' ').strip()

def export_comments_to_csv(comments: List[Dict], video_url: str) -> str:
    """Export comments to CSV with proper error handling"""
    try:
        os.makedirs("comments", exist_ok=True)
        video_id = extract_video_id(video_url)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_path = f"comments/comments_{video_id}_{timestamp}.csv"
        
        fieldnames = [
            'comment_id', 'text', 'likes', 'author',
            'author_id', 'timestamp', 'time_text', 'is_pinned'
        ]
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(comments)
            
        return csv_path
        
    except Exception as e:
        print(f"CSV export failed: {str(e)}")
        return ""

def extract_video_id(url: str) -> str:
    """Extract video ID from URL"""
    return url.split('v=')[-1][:11] if 'v=' in url else 'unknown'