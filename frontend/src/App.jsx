import { useEffect } from 'react';
import axios from 'axios';

function App() {
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h1>Hello from Vite + React</h1>;
}

export default App;
