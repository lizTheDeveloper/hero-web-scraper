const CloudNode = require('@ulixee/cloud');

(async () => {
  const cloudNode = new CloudNode();
  await cloudNode.listen();
})();