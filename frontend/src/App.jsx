import React, { useState } from 'react'

export default function App() {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [wireframe, setWireframe] = useState(null)

  const handleGenerate = async () => {
    if (!description.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate/wireframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          pageType: 'landing',
          device: 'desktop',
          complexity: 'medium',
        }),
      })
      
      const result = await response.json()
      console.log('Generated wireframe:', result)
      if (result.success) {
        setWireframe(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return React.createElement('div', { 
    style: { 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', { 
      key: 'title',
      style: { 
        fontSize: '48px', 
        textAlign: 'center', 
        marginBottom: '10px',
        color: '#333'
      }
    }, 'RazorAI'),
    
    React.createElement('p', { 
      key: 'subtitle',
      style: { 
        textAlign: 'center', 
        fontSize: '18px', 
        color: '#666', 
        marginBottom: '40px' 
      }
    }, 'Generate wireframes with AI, everywhere.'),
    
    React.createElement('div', { 
      key: 'form',
      style: { 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
      }
    }, [
      React.createElement('textarea', {
        key: 'textarea',
        value: description,
        onChange: (e) => setDescription(e.target.value),
        placeholder: "Describe your wireframe... (e.g., 'A modern SaaS landing page with hero section, features, and pricing')",
        style: {
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          resize: 'vertical',
          minHeight: '120px',
          boxSizing: 'border-box',
          marginBottom: '20px'
        }
      }),
      
      React.createElement('button', {
        key: 'button',
        onClick: handleGenerate,
        disabled: !description.trim() || isGenerating,
        style: {
          width: '100%',
          padding: '16px',
          fontSize: '18px',
          backgroundColor: '#000',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          opacity: (!description.trim() || isGenerating) ? 0.5 : 1
        }
      }, isGenerating ? 'Generating...' : 'Generate Wireframe')
    ]),
    
    wireframe && React.createElement('div', {
      key: 'wireframe',
      style: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    }, [
      React.createElement('h2', { 
        key: 'wireframe-title',
        style: { marginBottom: '20px', color: '#333' }
      }, wireframe.title),
      
      React.createElement('p', { 
        key: 'wireframe-desc',
        style: { color: '#666', marginBottom: '20px' }
      }, wireframe.description),
      
      React.createElement('div', {
        key: 'wireframe-preview',
        style: {
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          position: 'relative',
          minHeight: '300px'
        }
      }, wireframe.components.map((component, index) => 
        React.createElement('div', {
          key: component.id || index,
          style: {
            position: 'absolute',
            left: `${(component.x / wireframe.dimensions.width) * 100}%`,
            top: `${(component.y / wireframe.dimensions.height) * 100}%`,
            width: `${(component.width / wireframe.dimensions.width) * 100}%`,
            height: `${(component.height / wireframe.dimensions.height) * 100}%`,
            border: '1px solid #999',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#666'
          }
        }, component.content)
      ))
    ])
  ])
} 