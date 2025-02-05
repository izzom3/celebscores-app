import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch("http://localhost:7071/api/celebscores")
      .then((response) => response.text())
      .then((data) => setMessage(data));
  }, []);

  return (
    <div>
      <h1>Celeb Scores App</h1>
      <p>Backend response: {message}</p>
    </div>
  );
}

export default App;