const mergeInterval = (intervals) => {
    if (!Array.isArray(intervals)) return [];
  
    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    const result = [];
  
    for (let [start, end] of sorted) {
      if (result.length && result[result.length - 1][1] >= start) {
        result[result.length - 1][1] = Math.max(result[result.length - 1][1], end);
      } else {
        result.push([start, end]);
      }
    }
  
    return result;
  };
  
  export default mergeInterval;
  