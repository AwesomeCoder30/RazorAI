import React from 'react'
import ReactDOM from 'react-dom/client'
// @ts-ignore
import App from './App.jsx'

console.log('React main.tsx loaded!')

const rootElement = document.getElementById('root')
if (rootElement) {
  console.log('Root element found, creating React app...')
  const root = ReactDOM.createRoot(rootElement)
  root.render(React.createElement(App))
} else {
  console.error('Root element not found!')
} 