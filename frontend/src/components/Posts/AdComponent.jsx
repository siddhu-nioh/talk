
import React, { useEffect } from 'react';

const AdComponent = () => {
  useEffect(() => {
    // Initialize the ad
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '20px 0' }}>
{/*       Homepage banner ads */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8083013699653495"
        data-ad-slot="3706666517" 
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdComponent;
