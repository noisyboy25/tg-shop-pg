import { useEffect, useState } from 'react';
import { WebApp } from '@grammyjs/web-app';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(window.Telegram.WebApp.initData);
    WebApp.ready();
  }, []);

  return (
    <>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <button
        onClick={() => WebApp.HapticFeedback.notificationOccurred('success')}
      >
        Ping Bot
      </button>
      <p>{WebApp.version}</p>
    </>
  );
}

export default App;
