import express from 'express';

const port = 3000;
const rootUrl = `http://localhost:${port}`;
const title = 'PBS KIDS Video.js Test Harness';

const app = express();

const serverAlreadyRunning = async () => {
  let running = true;
  try {
    await fetch(rootUrl);
  } catch (e) {
    running = false;
  }
  return running;
};

const init = async (options) => {
  const running = await serverAlreadyRunning();
  if (running) {
    console.log(`\nFailed to start local express server. It looks like you may already have a server running?`);
    return;
  }
  
  app.use(express.static('public'));

  app.listen(port, () => {
    console.log(`\n${title} web server is running at ${rootUrl}`);
  });
};

init();