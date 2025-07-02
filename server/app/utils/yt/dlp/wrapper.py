
import os
import csv
import subprocess

def extract_comments(video_url: str, output_dir: str = "server/data/comments") -> str:
    os.makedirs(output_dir, exist_ok=True)

    video_id = video_url.split("v=")[-1].split("&")[0]
    output_csv_path = os.path.join(output_dir, f"{video_id}.csv")

    try:
        result = subprocess.run(
            ["yt-dlp", "--write-comments", "--skip-download", "-o", output_csv_path, video_url],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"Comments saved to {output_csv_path}")
    except subprocess.CalledProcessError as e:
        print(f"Subprocess failed: {e.stderr}")
        return None

    return output_csv_path
