from celery import Celery
from utils.yt.dlp.wrapper import extract_comments

celery = Celery(__name__, broker="redis://localhost:6379/0")

@celery.task
def extract_comments_task(channel_url: str, num_videos: int):
    return extract_comments(channel_url, num_videos)
