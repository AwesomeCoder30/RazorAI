import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('')
  const [health, setHealth] = useState('')

  useEffect(() => {
    // Test API connection
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage('API connection failed'))

    fetch('/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(err => setHealth('Health check failed'))
  }, [])

  return (
    <div className="app">
      <header>
        <h1>RazorAI</h1>
        <p>AI-Powered Wireframe Generation Platform</p>
      </header>
    </div>
  )
}

export default App 