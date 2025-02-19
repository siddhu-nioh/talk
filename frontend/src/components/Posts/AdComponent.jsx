import React, { useEffect } from 'react';

const AdComponent = () => {
  useEffect(() => {
    // Initialize the ad
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8083013699653495"
        data-ad-slot="1234567890" // Replace with your ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdComponent;
