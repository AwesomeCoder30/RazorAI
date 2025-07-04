import React, { useState, useRef, useEffect } from 'react'

export default function App() {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [wireframe, setWireframe] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const pageRef = useRef(null)

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
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    // Reset to center when mouse leaves
    setMousePosition({ x: viewportSize.width / 2, y: viewportSize.height / 2 })
  }

  const updateViewportSize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    setViewportSize({ width, height })
    // Initialize mouse position to center
    setMousePosition({ x: width / 2, y: height / 2 })
  }

  useEffect(() => {
    // Initialize viewport size
    updateViewportSize()
    
    // Add mouse listeners to the entire document
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('resize', updateViewportSize)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', updateViewportSize)
    }
  }, [])

  // Generate grid dots with mouse influence
  const generateGridDots = () => {
    const dots = []
    const spacing = 50
    const cols = Math.ceil(viewportSize.width / spacing) + 4
    const rows = Math.ceil(viewportSize.height / spacing) + 4
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const baseX = col * spacing - spacing
        const baseY = row * spacing - spacing
        
        // Calculate distance from mouse position
        const distanceFromMouse = Math.sqrt(
          Math.pow(baseX - mousePosition.x, 2) + 
          Math.pow(baseY - mousePosition.y, 2)
        )
        
        // Calculate influence - closer dots are more influenced
        const maxInfluence = 100 // Maximum distance for influence
        const influence = Math.max(0, 1 - distanceFromMouse / maxInfluence)
        
        // Apply displacement based on influence
        const displacement = 15 * influence // Maximum displacement of 15 pixels
        const directionX = baseX < mousePosition.x ? -1 : 1
        const directionY = baseY < mousePosition.y ? -1 : 1
        
        const x = baseX + (directionX * displacement * influence)
        const y = baseY + (directionY * displacement * influence)
        
        dots.push({
          id: `dot-${row}-${col}`,
          x,
          y,
          baseX,
          baseY,
          influence,
          opacity: 0.25 + (influence * 0.5) // Dots near mouse are more visible
        })
      }
    }
    
    return dots
  }

  // Generate connecting lines between dots
  const generateGridLines = (dots) => {
    const lines = []
    const spacing = 50
    const cols = Math.ceil(viewportSize.width / spacing) + 4
    
    dots.forEach((dot, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      // Remove horizontal and vertical lines - only keep diagonal lines for visual interest
      
      // Diagonal lines for visual complexity
      if (col < cols - 1 && row < Math.ceil(viewportSize.height / spacing) + 3) {
        const diagonalDot = dots[index + cols + 1]
        if (diagonalDot) {
          const avgInfluence = (dot.influence + diagonalDot.influence) / 2
          lines.push({
            id: `line-d1-${row}-${col}`,
            x1: dot.x,
            y1: dot.y,
            x2: diagonalDot.x,
            y2: diagonalDot.y,
            opacity: 0.03 + (avgInfluence * 0.15)
          })
        }
      }
      
      if (col > 0 && row < Math.ceil(viewportSize.height / spacing) + 3) {
        const diagonalDot = dots[index + cols - 1]
        if (diagonalDot) {
          const avgInfluence = (dot.influence + diagonalDot.influence) / 2
          lines.push({
            id: `line-d2-${row}-${col}`,
            x1: dot.x,
            y1: dot.y,
            x2: diagonalDot.x,
            y2: diagonalDot.y,
            opacity: 0.03 + (avgInfluence * 0.15)
          })
        }
      }
    })
    
    return lines
  }

  const dots = generateGridDots()
  const lines = generateGridLines(dots)

  return React.createElement('div', { 
    ref: pageRef,
    style: { 
      minHeight: '100vh',
      backgroundColor: '#FAFBFC',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative'
    }
  }, [
    // SVG Grid Background
    React.createElement('svg', {
      key: 'grid-svg',
      width: '100%',
      height: '100%',
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: 'none'
      },
      viewBox: `0 0 ${viewportSize.width} ${viewportSize.height}`,
      preserveAspectRatio: "xMidYMid slice"
    }, [
      // Generate all lines
      ...lines.map(line => 
        React.createElement('line', {
          key: line.id,
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2,
          stroke: `rgba(0, 0, 0, ${line.opacity})`,
          strokeWidth: 0.5,
          vectorEffect: "non-scaling-stroke"
        })
      ),
      
      // Generate all dots
      ...dots.map(dot => 
        React.createElement('circle', {
          key: dot.id,
          cx: dot.x,
          cy: dot.y,
          r: 1,
          fill: `rgba(0, 0, 0, ${dot.opacity})`,
          vectorEffect: "non-scaling-stroke"
        })
      )
    ]),

    // Grid info display
    React.createElement('div', {
      key: 'grid-info',
      style: {
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#6B7280',
        fontFamily: 'Monaco, monospace',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        zIndex: 50
      }
    }, [
      React.createElement('div', { key: 'grid-stats' }, `Grid: ${dots.length} dots, ${lines.length} lines`),
      React.createElement('div', { key: 'mouse-pos' }, `Mouse: ${mousePosition.x.toFixed(0)}, ${mousePosition.y.toFixed(0)}`)
    ]),

    // Content layer
    React.createElement('div', {
      key: 'content-layer',
      style: {
        position: 'relative',
        zIndex: 10
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
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)',
            padding: '32px', 
            borderRadius: '16px', 
            border: '1px solid rgba(229, 231, 235, 0.8)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
                  lineHeight: '1.5',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
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
                opacity: !description.trim() || isGenerating ? 0.6 : 1,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }
            }, isGenerating ? 'Generating...' : 'Generate')
          ])
        ]),
        
        // Wireframe display
        wireframe && React.createElement('div', {
          key: 'wireframe-display',
          style: { 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)',
            padding: '32px', 
            borderRadius: '16px', 
            border: '1px solid rgba(229, 231, 235, 0.8)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        }, [
          React.createElement('h2', {
            key: 'wireframe-title',
            style: { 
              fontSize: '24px', 
              fontWeight: '600',
              margin: '0 0 24px 0',
              color: '#111827'
            }
          }, 'Generated Wireframe'),
          
          React.createElement('div', {
            key: 'wireframe-content',
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '12px',
              padding: '24px',
              minHeight: '400px',
              position: 'relative'
            }
          }, [
            React.createElement('h3', {
              key: 'layout-title',
              style: { 
                fontSize: '20px', 
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: '#1F2937'
              }
            }, wireframe.layout || 'Layout'),
            
            React.createElement('div', {
              key: 'components-grid',
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }
            }, wireframe.components && wireframe.components.map((component, index) => 
              React.createElement('div', {
                key: `component-${index}`,
                style: {
                  backgroundColor: 'rgba(249, 250, 251, 0.8)',
                  border: '1px solid rgba(209, 213, 219, 0.6)',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'move',
                  transition: 'all 0.2s ease'
                }
              }, [
                React.createElement('h4', {
                  key: `component-title-${index}`,
                  style: { 
                    fontSize: '16px', 
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    color: '#374151'
                  }
                }, component.type || 'Component'),
                
                React.createElement('p', {
                  key: `component-desc-${index}`,
                  style: { 
                    fontSize: '14px', 
                    color: '#6B7280',
                    margin: '0',
                    lineHeight: '1.4'
                  }
                }, component.description || 'No description available')
              ])
            )),
            
            wireframe.notes && React.createElement('div', {
              key: 'notes-section',
              style: {
                backgroundColor: 'rgba(254, 243, 199, 0.8)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                padding: '16px'
              }
            }, [
              React.createElement('h4', {
                key: 'notes-title',
                style: { 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: '#92400e'
                }
              }, 'Notes'),
              
              React.createElement('p', {
                key: 'notes-content',
                style: { 
                  fontSize: '14px', 
                  color: '#92400e',
                  margin: '0',
                  lineHeight: '1.4'
                }
              }, wireframe.notes)
            ])
          ])
        ])
      ])
    ])
  ])
} 