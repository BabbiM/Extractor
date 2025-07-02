import yt_dlp

def get_videos_from_channel(channel_url: str, num_videos: int):
    # Ensure the URL points to the /videos page of the channel
    if not channel_url.endswith("/videos"):
        channel_url = channel_url.rstrip("/") + "/videos"

    ydl_opts = {
        "quiet": True,
        "extract_flat": True,
        "force_generic_extractor": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(channel_url, download=False)
        except Exception as e:
            print(f"Error extracting channel info: {e}")
            return []

    entries = info.get("entries", [])
    videos = []

    for entry in entries:
        if entry and "url" in entry and "title" in entry:
            url = entry["url"]
            # If it’s already a full URL, use it directly
            video_url = url if url.startswith("http") else f"https://www.youtube.com/watch?v={url}"
            videos.append({"title": entry["title"], "url": video_url})
            if len(videos) >= num_videos:
                break

    return videos
