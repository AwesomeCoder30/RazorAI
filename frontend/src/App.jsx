import React, { useState, useRef, useEffect } from 'react'

export default function App() {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [wireframe, setWireframe] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [isHoveringUI, setIsHoveringUI] = useState(false)
  const pageRef = useRef(null)

  // Intelligent page type detection
  const detectPageType = (description) => {
    const text = description.toLowerCase()
    
    // Dashboard keywords
    if (text.includes('dashboard') || text.includes('admin') || text.includes('analytics') || 
        text.includes('charts') || text.includes('data') || text.includes('metrics') ||
        text.includes('management') || text.includes('control panel')) {
      return 'dashboard'
    }
    
    // E-commerce keywords
    if (text.includes('shop') || text.includes('store') || text.includes('ecommerce') || 
        text.includes('e-commerce') || text.includes('products') || text.includes('cart') ||
        text.includes('buy') || text.includes('sell') || text.includes('retail')) {
      return 'ecommerce'
    }
    
    // Blog keywords
    if (text.includes('blog') || text.includes('article') || text.includes('content') || 
        text.includes('news') || text.includes('post') || text.includes('writing') ||
        text.includes('story') || text.includes('journal')) {
      return 'blog'
    }
    
    // Form keywords
    if (text.includes('form') || text.includes('signup') || text.includes('register') || 
        text.includes('contact') || text.includes('survey') || text.includes('application')) {
      return 'form'
    }
    
    // Default to landing page
    return 'landing'
  }

  const handleGenerate = async () => {
    if (!description.trim()) return
    
    setIsGenerating(true)
    try {
      const pageType = detectPageType(description.trim())
      console.log('Detected page type:', pageType, 'for description:', description.trim())
      
      const response = await fetch('/api/generate/wireframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          pageType: pageType,
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

    // Mouse position indicator (hidden when hovering over UI)
    !isHoveringUI && React.createElement('div', {
      key: 'mouse-indicator',
      style: {
        position: 'fixed',
        left: mousePosition.x - 2,
        top: mousePosition.y - 2,
        width: '4px',
        height: '4px',
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 100,
        transition: 'all 0.1s ease-out'
      }
    }),

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
      },
      onMouseEnter: () => setIsHoveringUI(true),
      onMouseLeave: () => setIsHoveringUI(false)
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
        },
        onMouseEnter: () => setIsHoveringUI(true),
        onMouseLeave: () => setIsHoveringUI(false)
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
        }, 'Generate wireframes with AI')
      ]),
      
      // Main content area
      React.createElement('div', { 
        key: 'main',
        style: { 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 64px'
        },
        onMouseEnter: () => setIsHoveringUI(true),
        onMouseLeave: () => setIsHoveringUI(false)
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
          },
          onMouseEnter: () => setIsHoveringUI(true),
          onMouseLeave: () => setIsHoveringUI(false)
        }, [
                  React.createElement('div', {
          key: 'search-container',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s ease',
            ':hover': {
              borderColor: '#d1d5db'
            }
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = '#d1d5db'
            setIsHoveringUI(true)
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            setIsHoveringUI(false)
          }
        }, [
          // Search icon
          React.createElement('div', {
            key: 'search-icon',
            style: {
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af'
            }
          }, React.createElement('svg', {
            width: '20',
            height: '20',
            viewBox: '0 0 20 20',
            fill: 'currentColor'
          }, React.createElement('path', {
            fillRule: 'evenodd',
            d: 'M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z',
            clipRule: 'evenodd'
          }))),
          
          // Search input
          React.createElement('input', {
            key: 'search-input',
            type: 'text',
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: "Search for projects...",
            style: {
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: '#374151',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              '::placeholder': {
                color: '#9ca3af'
              }
            },
            onKeyDown: (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerate()
              }
            }
          }),
          
          // Search button
          React.createElement('button', {
            key: 'search-button',
            onClick: handleGenerate,
            disabled: !description.trim() || isGenerating,
            style: {
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !description.trim() || isGenerating ? 'not-allowed' : 'pointer',
              opacity: !description.trim() || isGenerating ? 0.6 : 1,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            },
            onMouseEnter: (e) => {
              if (!(!description.trim() || isGenerating)) {
                e.currentTarget.style.backgroundColor = '#4b5563'
              }
            },
            onMouseLeave: (e) => {
              if (!(!description.trim() || isGenerating)) {
                e.currentTarget.style.backgroundColor = '#6b7280'
              }
            }
          }, isGenerating ? 'Generating...' : 'Search')
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
          },
          onMouseEnter: () => setIsHoveringUI(true),
          onMouseLeave: () => setIsHoveringUI(false)
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
              minHeight: '600px',
              position: 'relative',
              overflow: 'hidden'
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
            }, wireframe.title || 'Wireframe'),
            
            // Professional wireframe canvas
            React.createElement('div', {
              key: 'wireframe-canvas',
              style: {
                position: 'relative',
                width: '100%',
                height: '500px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }
            }, wireframe.components && wireframe.components.map((component, index) => {
              const renderComponent = () => {
                const baseStyle = {
                  position: 'absolute',
                  left: `${component.x}%`,
                  top: `${component.y}%`,
                  width: `${component.width}%`,
                  height: `${component.height}%`,
                  cursor: 'move',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  ...(component.style || {})
                }

                // Component-specific styling
                switch (component.type) {
                  case 'header':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: component.style?.backgroundColor || '#ffffff',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 2rem',
                        fontWeight: '600',
                        fontSize: '14px'
                      }
                    }, component.content || 'Header')

                  case 'navbar':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        padding: '0 1rem'
                      }
                    }, component.content || 'Navigation')

                  case 'hero':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: component.style?.backgroundColor || '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '2rem'
                      }
                    }, React.createElement('div', {
                      style: {
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                      }
                    }, component.content || 'Hero Section'))

                  case 'heading':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        fontSize: component.style?.fontSize || '24px',
                        fontWeight: '700',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }
                    }, component.content || 'Heading')

                  case 'paragraph':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '1rem'
                      }
                    }, component.content || 'Paragraph text')

                  case 'button':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: component.style?.backgroundColor || '#3b82f6',
                        color: component.style?.color || 'white',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: component.style?.border || 'none'
                      }
                    }, component.content || 'Button')

                  case 'card':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }
                    }, React.createElement('div', {
                      style: {
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }
                    }, component.content || 'Card'))

                  case 'sidebar':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#1f2937',
                        color: 'white',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                      }
                    }, 
                      React.createElement('div', { style: { fontWeight: '600', fontSize: '12px' } }, 'Sidebar'),
                      React.createElement('div', { style: { fontSize: '10px', opacity: '0.8' } }, 'Menu items')
                    )

                  case 'stats':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }
                    }, 
                      React.createElement('div', {
                        style: {
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1f2937',
                          marginBottom: '0.25rem'
                        }
                      }, component.content || 'Stat'),
                      React.createElement('div', {
                        style: {
                          fontSize: '10px',
                          color: '#6b7280'
                        }
                      }, 'Metric')
                    )

                  case 'chart':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }, 
                      React.createElement('div', {
                        style: {
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%)',
                          backgroundSize: '10px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#6b7280'
                        }
                      }, component.content || 'Chart')
                    )

                  case 'table':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }
                    }, 
                      React.createElement('div', {
                        style: {
                          padding: '0.75rem',
                          backgroundColor: '#f9fafb',
                          borderBottom: '1px solid #e5e7eb',
                          fontSize: '12px',
                          fontWeight: '600'
                        }
                      }, component.content || 'Table'),
                      React.createElement('div', {
                        style: {
                          padding: '0.75rem',
                          fontSize: '10px',
                          color: '#6b7280'
                        }
                      }, 'Table data')
                    )

                  case 'footer':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#1f2937',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }
                    }, component.content || 'Footer')

                  case 'section':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: component.style?.backgroundColor || '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#6b7280'
                      }
                    }, component.content || 'Section')

                  case 'search':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#6b7280'
                      }
                    }, component.content || 'Search...')

                  case 'filter':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '12px',
                        color: '#374151'
                      }
                    }, 
                      React.createElement('div', { style: { fontWeight: '600' } }, 'Filters'),
                      React.createElement('div', { style: { fontSize: '10px', opacity: '0.8' } }, 'Category, Price, etc.')
                    )

                  case 'grid':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                        fontSize: '10px',
                        color: '#6b7280'
                      }
                    }, 
                      ...Array(6).fill(0).map((_, i) => 
                        React.createElement('div', {
                          key: i,
                          style: {
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            padding: '0.5rem',
                            textAlign: 'center'
                          }
                        }, `Item ${i + 1}`)
                      )
                    )

                  case 'shopping-cart':
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }
                    }, component.content || 'Cart (0)')

                  default:
                    return React.createElement('div', {
                      style: {
                        ...baseStyle,
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#495057'
                      }
                    }, component.content || component.type)
                }
              }

              return renderComponent()
            }))
          ])
        ])
      ])
    ])
  ])
} 