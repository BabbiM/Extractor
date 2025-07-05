import os
import csv
from datetime import datetime
from typing import Tuple, List, Dict
from yt_dlp import YoutubeDL

def extract_comments(video_url: str) -> Tuple[int, List[Dict]]:
    """Original working function"""
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
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            raw_comments = info.get('comments', [])
            
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
            
            return len(comments), comments
    except Exception as e:
        print(f"Error in extract_comments: {str(e)}")
        return 0, []

def clean_text(text: str) -> str:
    return text.replace('\n', ' ').replace('\r', ' ').strip()