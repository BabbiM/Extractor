from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse  # Added FileResponse import
import os
from datetime import datetime
import pandas as pd
from ..utils.yt.dlp.channel_scraper import extract_channel_comments

router = APIRouter()

@router.get("/extract_channel")
async def extract_channel(request: Request):
    try:
        channel_url = request.query_params.get("channel_url")
        num_videos = int(request.query_params.get("num_videos", 1))
        download = request.query_params.get("download", "false").lower() == "true"

        print(f"Processing request for channel: {channel_url}")
        stats, csv_path = extract_channel_comments(channel_url, num_videos)

        if download:
            if not os.path.exists(csv_path):
                raise HTTPException(status_code=404, detail="CSV file not found")
            
            # Read and combine all comments from all videos
            all_comments = []
            channel_id = channel_url.split('@')[-1].split('/')[0]
            
            for video_url, video_data in stats.items():
                video_comments = pd.read_csv(video_data['csv_path'])
                video_comments['channel_id'] = channel_id
                video_comments['video_url'] = video_url
                video_comments['video_title'] = video_data['title']
                video_comments['upload_date'] = video_data.get('upload_date', 'N/A')
                all_comments.append(video_comments)
            
            combined_df = pd.concat(all_comments)
            combined_csv_path = f"comments/combined_{channel_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            combined_df.to_csv(combined_csv_path, index=False)
            
            return FileResponse(
                path=combined_csv_path,
                media_type='text/csv',
                filename=f"youtube_comments_{channel_id}_all_videos.csv"
            )

        channel_id = channel_url.split('@')[-1].split('/')[0]
        return JSONResponse(content={
            "status": "success",
            "analytics": {
                "channel_id": channel_id,
                "num_scraped_videos": len(stats),
                "total_comments": sum(v['total_comments'] for v in stats.values())
            }
        })

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )