function performAnalytics (api) {
  const siteUrl = window.location.href;
  const performanceTiming = window.performance.toJSON().timing;
  const currentTime = new Date().valueOf();
  let fcp, ttfb, windowLoad, domLoad;

  const isPerformanceObserverSupported = () => {
    return typeof PerformanceObserver === 'function';
  };

  const convertMsToSecond = (ms) => {
    return (ms / 1000);
  };

  const getWindowLoad = (performanceTiming) => {
    return convertMsToSecond(currentTime - performanceTiming.navigationStart);
  };

  const getTtfb = (performanceTiming) => {
    return convertMsToSecond(performanceTiming.responseStart - performanceTiming.navigationStart);
  };

  const getDomLoad = (performanceTiming) => {
    return convertMsToSecond(performanceTiming.domContentLoadedEventEnd - performanceTiming.navigationStart);
  };

  const getFcp = (entryList) => {
    return convertMsToSecond(entryList.getEntriesByName('first-contentful-paint')[0].startTime);
  };

  const startObserver = () => {
    if (!isPerformanceObserverSupported) {
      console.error("reporter error; PerformanceObserver NOT supported!");
      return;
    }
  
    let observer = new PerformanceObserver((entryList) => {
      fcp = getFcp(entryList);
    });
  
    observer.observe({type: 'paint', buffered: true});
  };

  const getPerformanceTiming = () => {
    if (!performanceTiming) {
      console.error("reporter error; Performance NOT supported!");
      return;
    }
  
    ttfb = getTtfb(performanceTiming);
    domLoad = getDomLoad(performanceTiming);
    windowLoad = getWindowLoad(performanceTiming);
  };

  const sendRequest = () => {
    const request = setInterval(() => {
      let data = {
        "siteUrl": siteUrl,
        "date": performance.timeOrigin,
        "ttfb": ttfb, // Time to first byte
        "fcp": fcp, // First contentful paint
        "domLoad": domLoad,
        "windowLoad": windowLoad,
      };
  
      console.log("PerfanalyticsJS Request Object : ", data);
  
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      };
  
      fetch(api, options).then((response) => console.debug(response));
  
      clearInterval(request);
  
    }, 500);
  };

  window.addEventListener('load', () => {
    startObserver();
    getPerformanceTiming();
    sendRequest();
  });
}

module.exports = performAnalytics