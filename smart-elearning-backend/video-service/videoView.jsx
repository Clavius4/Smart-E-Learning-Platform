import React, { useRef, useState } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/dist/plyr.css';

const VideoPlayer = ({ videoData }) => {
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Adaptive streaming sources (if available)
  const sources = {
    type: 'video',
    sources: [
      {
        src: videoData.url,
        type: 'video/mp4',
        size: 720
      },
      // Add additional quality levels if available
    ],
    poster: videoData.thumbnail,
    captions: videoData.caption ? [
      {
        kind: 'captions',
        label: 'English',
        srclang: 'en',
        src: `/api/videos/${videoData.id}/captions.vtt`,
        default: true
      }
    ] : []
  };

  return (
    <div className="video-container">
      {loading && <div className="video-loading">Loading video...</div>}
      <Plyr
        ref={playerRef}
        source={sources}
        options={{
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'captions',
            'settings',
            'fullscreen'
          ],
          settings: ['quality', 'speed'],
          quality: {
            default: 720,
            options: [1080, 720, 480]
          }
        }}
        onReady={() => setLoading(false)}
      />
      
      {/* Sign language interpreter overlay */}
      {videoData.signLanguageIncluded && (
        <div className="sign-language-overlay">
          <button onClick={toggleInterpreter}>Toggle Sign Language</button>
          <video 
            src={`${videoData.url}_sign_language.mp4`}
            className="interpreter-video"
            controls
          />
        </div>
      )}
    </div>
  );
};