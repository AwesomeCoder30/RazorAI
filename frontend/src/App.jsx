import React, { useState, useRef } from 'react'

export default function App() {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [wireframe, setWireframe] = useState(null)
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

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

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Calculate offset based on mouse position (subtle movement)
    const offsetX = (x / rect.width - 0.5) * 8
    const offsetY = (y / rect.height - 0.5) * 8
    
    setGridOffset({ x: offsetX, y: offsetY })
  }

  const handleMouseLeave = () => {
    setGridOffset({ x: 0, y: 0 })
  }

  return React.createElement('div', { 
    style: { 
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }
  }, [
    // Header section
    React.createElement('div', { 
      key: 'header',
      style: { 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '64px 24px 32px',
        textAlign: 'center'
      }
    }, [
      React.createElement('h1', { 
        key: 'title',
        style: { 
          fontSize: '64px', 
          fontWeight: '700',
          margin: '0 0 16px 0',
          color: '#000000',
          letterSpacing: '-0.025em'
        }
      }, 'RazorAI'),
      
      React.createElement('p', { 
        key: 'subtitle',
        style: { 
          fontSize: '20px', 
          color: '#6B7280',
          margin: '0 0 48px 0',
          fontWeight: '400'
        }
      }, 'Generate wireframes with AI, everywhere.')
    ]),
    
    // Main content area
    React.createElement('div', { 
      key: 'main',
      style: { 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px 64px'
      }
    }, [
      // Input section
      React.createElement('div', { 
        key: 'input-section',
        style: { 
          backgroundColor: '#ffffff', 
          padding: '32px', 
          borderRadius: '16px', 
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '32px'
        }
      }, [
        React.createElement('div', {
          key: 'input-wrapper',
          style: { display: 'flex', gap: '16px', alignItems: 'flex-end' }
        }, [
          React.createElement('div', {
            key: 'textarea-wrapper',
            style: { flex: 1 }
          }, [
            React.createElement('textarea', {
              key: 'textarea',
              value: description,
              onChange: (e) => setDescription(e.target.value),
              placeholder: "Describe your wireframe...",
              style: {
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '1px solid #D1D5DB',
                borderRadius: '12px',
                resize: 'vertical',
                minHeight: '120px',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }
            })
          ]),
          
          React.createElement('button', {
            key: 'button',
            onClick: handleGenerate,
            disabled: !description.trim() || isGenerating,
            style: {
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: !description.trim() || isGenerating ? 'not-allowed' : 'pointer',
              opacity: (!description.trim() || isGenerating) ? 0.6 : 1,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }
          }, isGenerating ? 'Generating...' : 'Generate')
        ])
      ]),
      
      // Interactive Canvas - Always visible
      React.createElement('div', {
        key: 'canvas-section',
        style: {
          backgroundColor: '#ffffff',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          marginBottom: '32px'
        }
      }, [
        React.createElement('h2', { 
          key: 'canvas-title',
          style: { 
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            color: '#111827'
          }
        }, 'Interactive Canvas'),
        
        React.createElement('p', { 
          key: 'canvas-desc',
          style: { 
            color: '#6B7280',
            margin: '0 0 24px 0',
            fontSize: '16px'
          }
        }, 'Move your mouse over the canvas to see the interactive grid effect.'),
        
        React.createElement('div', {
          key: 'wireframe-canvas',
          ref: canvasRef,
          onMouseMove: handleMouseMove,
          onMouseLeave: handleMouseLeave,
          style: {
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '24px',
            backgroundColor: '#FAFBFC',
            position: 'relative',
            minHeight: '500px',
            overflow: 'hidden',
            cursor: 'crosshair',
            backgroundImage: `
              linear-gradient(rgba(156, 163, 175, 0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(156, 163, 175, 0.6) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: `${gridOffset.x}px ${gridOffset.y}px`,
            transition: 'background-position 0.2s ease-out'
          }
        }, [
          // Major grid overlay
          React.createElement('div', {
            key: 'major-grid',
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(rgba(79, 70, 229, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(79, 70, 229, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
              backgroundPosition: `${gridOffset.x * 2}px ${gridOffset.y * 2}px`,
              transition: 'background-position 0.2s ease-out',
              pointerEvents: 'none'
            }
          }),
          
          // Center indicator
          React.createElement('div', {
            key: 'center-indicator',
            style: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '4px',
              height: '4px',
              backgroundColor: '#4F46E5',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 5
            }
          }),
          
          // Grid info
          React.createElement('div', {
            key: 'grid-info',
            style: {
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontSize: '12px',
              color: '#6B7280',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 12px',
              borderRadius: '6px',
              pointerEvents: 'none',
              zIndex: 10
            }
          }, `Grid Offset: X: ${gridOffset.x.toFixed(1)}px, Y: ${gridOffset.y.toFixed(1)}px`),
          
          // Wireframe components (if any)
          wireframe && wireframe.components.map((component, index) => 
            React.createElement('div', {
              key: component.id || index,
              style: {
                position: 'absolute',
                left: `${(component.x / wireframe.dimensions.width) * 100}%`,
                top: `${(component.y / wireframe.dimensions.height) * 100}%`,
                width: `${(component.width / wireframe.dimensions.width) * 100}%`,
                height: `${(component.height / wireframe.dimensions.height) * 100}%`,
                border: '2px solid #4F46E5',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#4F46E5',
                fontWeight: '600',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)',
                backdropFilter: 'blur(2px)',
                zIndex: 10
              }
            }, component.content)
          )
        ])
      ])
    ])
  ])
} 