import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, notification, Table, Card, Row, Col, Typography } from 'antd';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

function ExtractForm() {
  const [channelUrl, setChannelUrl] = useState(localStorage.getItem('last-channel-url') || '');
  const [numVideos, setNumVideos] = useState(Number(localStorage.getItem('last-num-videos')) || 1);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analytics, setAnalytics] = useState(() => {
    const savedAnalytics = localStorage.getItem('youtube-analytics');
    return savedAnalytics ? JSON.parse(savedAnalytics) : null;
  });
  const [channelHistory, setChannelHistory] = useState(() => {
    const savedHistory = localStorage.getItem('channel-history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const downloadLinkRef = useRef(null);

  // Save channel URL and numVideos when they change
  useEffect(() => {
    localStorage.setItem('last-channel-url', channelUrl);
    localStorage.setItem('last-num-videos', numVideos.toString());
  }, [channelUrl, numVideos]);

  // Save channel URL to history when it changes
  useEffect(() => {
    if (channelUrl && !channelHistory.includes(channelUrl)) {
      const updatedHistory = [channelUrl, ...channelHistory].slice(0, 5);
      setChannelHistory(updatedHistory);
      localStorage.setItem('channel-history', JSON.stringify(updatedHistory));
    }
  }, [channelUrl]);

  // Clean up download link on unmount
  useEffect(() => {
    return () => {
      if (downloadLinkRef.current) {
        document.body.removeChild(downloadLinkRef.current);
      }
    };
  }, []);

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!channelUrl.trim()) return;
    
    setLoading(true);
    setActionStatus('Extracting comments...');
    setExtractionComplete(false);
    setDownloadComplete(false);
    setIsDownloading(false);

    try {
      const response = await axios.get('http://127.0.0.1:8000/extract_channel', {
        params: {
          channel_url: channelUrl.trim(),
          num_videos: numVideos
        }
      });

      const newAnalytics = response.data.analytics;
      const mergedAnalytics = analytics ? {
        ...newAnalytics,
        total_comments: (analytics.total_comments || 0) + newAnalytics.total_comments,
        num_scraped_videos: (analytics.num_scraped_videos || 0) + newAnalytics.num_scraped_videos
      } : newAnalytics;

      setAnalytics(mergedAnalytics);
      localStorage.setItem('youtube-analytics', JSON.stringify(mergedAnalytics));

      setExtractionComplete(true);
      notification.success({
        message: 'Extraction Complete',
        description: `Added ${newAnalytics.total_comments} comments from ${newAnalytics.num_scraped_videos} videos.`,
        duration: 4.5
      });
    } catch (err) {
      notification.error({
        message: 'Extraction Failed',
        description: err.response?.data?.message || 'Please check the URL and try again',
        duration: 4.5
      });
    } finally {
      setLoading(false);
      setActionStatus('');
    }
  };

  const handleDownload = async () => {
    if (!extractionComplete) return;
    
    setLoading(true);
    setIsDownloading(true);
    setActionStatus('Preparing download...');

    try {
      // Create a hidden download link
      const downloadUrl = `http://127.0.0.1:8000/extract_channel?channel_url=${
        encodeURIComponent(channelUrl.trim())
      }&num_videos=${numVideos}&download=true`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute(
        'download',
        `youtube_comments_${analytics.channel_id}_${new Date().toISOString().slice(0,10)}.csv`
      );
      link.style.display = 'none';
      document.body.appendChild(link);
      downloadLinkRef.current = link;

      setActionStatus('Downloading...');
      
      // Trigger the download
      link.click();

      // This is a workaround to detect when download starts
      // Note: There's no perfect way to detect download completion client-side
      const checkDownload = setInterval(() => {
        // Assume download completed after 500ms (adjust as needed)
        clearInterval(checkDownload);
        setDownloadComplete(true);
        setIsDownloading(false);
        setLoading(false);
        setActionStatus('Download complete!');
        notification.success({
          message: 'Download Started',
          description: 'Your CSV file should begin downloading shortly.',
          duration: 4.5
        });
      }, 500);

    } catch (err) {
      notification.error({
        message: 'Download Failed',
        description: err.message || 'Failed to initiate download',
        duration: 4.5
      });
      setActionStatus('Download failed');
      setIsDownloading(false);
      setLoading(false);
    }
  };

  const analyticsColumns = [
    {
      title: 'Channel',
      dataIndex: 'channel_id',
      key: 'channel',
      render: (text) => (
        <a href={`https://youtube.com/${text}`} target="_blank" rel="noopener noreferrer">
          @{text}
        </a>
      )
    },
    {
      title: 'Total Videos',
      dataIndex: 'num_scraped_videos',
      key: 'videos',
    },
    {
      title: 'Total Comments',
      dataIndex: 'total_comments',
      key: 'comments',
    },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card title="YouTube Comment Extractor" style={{ marginBottom: '24px' }}>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={18}>
            <Input
              placeholder="Enter YouTube Channel URL (e.g., https://www.youtube.com/@ChannelName)"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              disabled={loading || isDownloading}
              list="channel-history"
            />
            <datalist id="channel-history">
              {channelHistory.map((url, index) => (
                <option key={index} value={url} />
              ))}
            </datalist>
          </Col>
          <Col span={6}>
            <Input
              type="number"
              min={1}
              placeholder="Number of Videos"
              value={numVideos}
              onChange={(e) => setNumVideos(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={loading || isDownloading}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: '8px' }}>
          <Col span={12}>
            <Button
              type="primary"
              onClick={handleExtract}
              loading={loading && !isDownloading}
              disabled={!channelUrl || isDownloading || (extractionComplete && !downloadComplete)}
              block
            >
              Extract Comments
            </Button>
          </Col>
          <Col span={12}>
            <Button
              type="default"
              onClick={handleDownload}
              icon={isDownloading ? <LoadingOutlined /> : <DownloadOutlined />}
              loading={isDownloading}
              disabled={!extractionComplete || isDownloading}
              block
            >
              {isDownloading ? 'Downloading...' : 'Download CSV'}
            </Button>
          </Col>
        </Row>

        {actionStatus && (
          <Row>
            <Col span={24}>
              <Text 
                type={downloadComplete ? "success" : isDownloading ? "warning" : "secondary"} 
                style={{ 
                  display: 'block', 
                  textAlign: 'center',
                  animation: downloadComplete ? 'blink 1s 3' : 'none',
                  marginTop: '8px'
                }}
              >
                {actionStatus}
                {isDownloading && <LoadingOutlined style={{ marginLeft: 8 }} />}
              </Text>
              <style>
                {`
                  @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                  }
                `}
              </style>
            </Col>
          </Row>
        )}
      </Card>

      {analytics && (
        <Card title="Analytics Dashboard">
          <Table
            columns={analyticsColumns}
            dataSource={[analytics]}
            pagination={false}
            rowKey="channel_id"
            bordered
            style={{ marginBottom: '16px' }}
          />
          <div style={{ color: '#666' }}>
            <p>CSV contains all comments from all scraped videos with:</p>
            <ul>
              <li>Channel: @{analytics.channel_id}</li>
              <li>Video titles and URLs</li>
              <li>Complete comment data from all videos</li>
              <li>Timestamps and engagement metrics</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ExtractForm;