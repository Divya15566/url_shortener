module.exports = {
    isMobile: (userAgent) => {
      if (!userAgent) return false;
      return /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent);
    },
    getDeviceType: (userAgent) => {
      if (!userAgent) return 'desktop';
      
      const isTablet = /Tablet|iPad/i.test(userAgent);
      const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent);
      const isBot = /bot|crawl|spider/i.test(userAgent);
  
      if (isBot) return 'bot';
      if (isTablet) return 'tablet';
      if (isMobile) return 'mobile';
      return 'desktop';
    },
    getBrowser: (userAgent) => {
      if (!userAgent) return 'Unknown';
      
      if (/edg/i.test(userAgent)) return 'Edge';
      if (/opr/i.test(userAgent)) return 'Opera';
      if (/chrome/i.test(userAgent)) return 'Chrome';
      if (/safari/i.test(userAgent)) return 'Safari';
      if (/firefox/i.test(userAgent)) return 'Firefox';
      if (/msie/i.test(userAgent)) return 'IE';
      
      return 'Unknown';
    }
  };