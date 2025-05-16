import React, { useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

const JitsiMeetingComponent = ({ roomName, onMeetingEnd, user }) => {
  // Ensure user object has required properties
  const safeUser = user || { 
    name: 'Participant', 
    email: 'anonymous@example.com' 
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <JitsiMeeting
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableInviteFunctions: true
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_CHROME_EXTENSION_BANNER: false
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
        onReadyToClose={onMeetingEnd}
        userInfo={{
          displayName: safeUser.name,
          email: safeUser.email
        }}
      />
    </div>
  );
};

export default JitsiMeetingComponent;