import React, { useState, useEffect } from 'react';
import { Button, Input, notification, Card, Row, Col, Typography, Table, Modal } from 'antd';
import { DownloadOutlined, LoadingOutlined, ClearOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

const ExtractForm = () => {
  const [channelUrl, setChannelUrl] = useState(localStorage.getItem('last-channel-url') || '');
  const [numVideos, setNumVideos] = useState(parseInt(localStorage.getItem('last-num-videos')) || 3);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem('yt-analytics');
    if (saved) {
      try {
        setAnalytics(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('yt-analytics');
      }
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('last-channel-url', channelUrl);
    localStorage.setItem('last-num-videos', numVideos.toString());
    if (analytics) {
      localStorage.setItem('yt-analytics', JSON.stringify(analytics));
    }
  }, [channelUrl, numVideos, analytics]);

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!channelUrl.trim()) {
      notification.warning({
        message: 'Input Required',
        description: 'Please enter a YouTube channel URL',
      });
      return;
    }

    setLoading(true);
    setStatus('Extracting comments...');
    setAnalytics(null);

    try {
      const response = await axios.get('http://localhost:8000/api/extract_channel', {
        params: {
          channel_url: channelUrl.trim(),
          num_videos: numVideos,
          force: true  // Force re-scraping
        },
        timeout: 300000
      });

      const channelId = channelUrl.includes('@') 
        ? channelUrl.split('@')[1].split('/')[0]
        : channelUrl.split('/').pop() || 'channel';

      setAnalytics({
        ...response.data,
        channel_id: channelId
      });

      setStatus(`Extracted ${response.data.total_comments} comments from ${response.data.num_scraped_videos} videos`);
      
      notification.success({
        message: 'Extraction Complete',
        description: response.data.message || 'Data extracted successfully',
      });
    } catch (err) {
      setStatus('Extraction failed');
      notification.error({
        message: 'Extraction Error',
        description: err.response?.data?.detail || err.message || 'Failed to extract comments',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
  if (!analytics) return;

  setIsDownloading(true);
  setStatus('Preparing download...');

  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const channelName = channelUrl.includes('@') 
      ? channelUrl.split('@')[1].split('/')[0]
      : `channel-${timestamp}`;

    // Create a hidden link and trigger click
    const link = document.createElement('a');
    link.href = `http://localhost:8000/api/extract_channel?channel_url=${
      encodeURIComponent(channelUrl.trim())
    }&num_videos=${numVideos}&download=true`;
    link.download = `youtube_comments_${channelName}_${timestamp}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatus('Download started! Check your downloads folder.');
  } catch (err) {
    notification.error({
      message: 'Download Error',
      description: err.message || 'Failed to initiate download',
    });
    setStatus('Download failed');
  } finally {
    setIsDownloading(false);
  }
};

  const clearData = async () => {
    setIsClearing(true);
    try {
      await axios.post('http://localhost:8000/api/clear_scraped_data');
      notification.success({
        message: 'Data Cleared',
        description: 'All scraped data has been reset',
      });
      setAnalytics(null);
      setStatus('Data cleared. You can now extract fresh data.');
    } catch (err) {
      notification.error({
        message: 'Clear Error',
        description: err.response?.data?.detail || err.message || 'Failed to clear data',
      });
    } finally {
      setIsClearing(false);
      setModalVisible(false);
    }
  };

  const tableData = analytics ? [{
    key: analytics.channel_id || 'current',
    channel: analytics.channel_id || 'Current Channel',
    videos: analytics.num_scraped_videos,
    comments: analytics.total_comments,
    average: Math.round(analytics.total_comments / Math.max(1, analytics.num_scraped_videos))
  }] : [];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <Card 
        title={<Title level={3} style={{ margin: 0 }}>YouTube Comment Extractor</Title>}
        style={{ marginBottom: '24px' }}
        extra={
          <Button
            danger
            icon={<ClearOutlined />}
            onClick={() => setModalVisible(true)}
            loading={isClearing}
          >
            Clear Data
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} md={18}>
            <Input
              placeholder="Enter YouTube Channel URL (e.g., https://www.youtube.com/@ChannelName)"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              disabled={loading}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Input
              type="number"
              min={1}
              max={50}
              placeholder="Videos to scan"
              value={numVideos}
              onChange={(e) => setNumVideos(Math.max(1, Math.min(50, e.target.valueAsNumber || 3)))}
              disabled={loading}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} md={12}>
            <Button
              type="primary"
              onClick={handleExtract}
              loading={loading}
              disabled={!channelUrl.trim() || loading}
              block
              icon={loading ? <LoadingOutlined /> : null}
              size="large"
            >
              {loading ? 'Extracting...' : 'Extract Comments'}
            </Button>
          </Col>
          <Col xs={24} md={12}>
            <Button
              type="default"
              onClick={handleDownload}
              loading={isDownloading}
              disabled={!analytics || isDownloading}
              block
              icon={<DownloadOutlined />}
              size="large"
            >
              {isDownloading ? 'Preparing Download...' : 'Download CSV'}
            </Button>
          </Col>
        </Row>

        {status && (
          <Text
            type={status.includes('failed') ? 'danger' : 
                  status.includes('Success') ? 'success' : 'secondary'}
            style={{ 
              display: 'block', 
              textAlign: 'center', 
              marginTop: '16px',
              fontSize: '16px'
            }}
          >
            {status}
          </Text>
        )}
      </Card>

      {analytics && (
        <Card title="Extraction Results">
          <Table
            columns={[
              {
                title: 'Channel',
                dataIndex: 'channel',
                key: 'channel',
                render: (text) => (
                  <Text strong copyable>{text}</Text>
                )
              },
              {
                title: 'Videos Processed',
                dataIndex: 'videos',
                key: 'videos',
                align: 'center'
              },
              {
                title: 'Total Comments',
                dataIndex: 'comments',
                key: 'comments',
                align: 'center'
              },
              {
                title: 'Avg. Comments/Video',
                dataIndex: 'average',
                key: 'average',
                align: 'center'
              }
            ]}
            dataSource={tableData}
            pagination={false}
            bordered
            size="middle"
          />

          <div style={{ marginTop: '24px' }}>
            <Text strong style={{ fontSize: '16px' }}>CSV File Contains:</Text>
            <ul>
              <li><Text>Video ID and Title</Text></li>
              <li><Text>Original Channel URL</Text></li>
              <li><Text>Comment Text (with special characters preserved)</Text></li>
              <li><Text>Author Information</Text></li>
              <li><Text>Like Counts and Timestamps</Text></li>
            </ul>
          </div>
        </Card>
      )}

      <Modal
        title="Confirm Clear Data"
        visible={modalVisible}
        onOk={clearData}
        onCancel={() => setModalVisible(false)}
        confirmLoading={isClearing}
      >
        <p>Are you sure you want to clear all scraped data?</p>
        <p>This will reset your extraction history and cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ExtractForm;