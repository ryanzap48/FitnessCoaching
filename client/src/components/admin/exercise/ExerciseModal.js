import { useState, useEffect, useRef } from 'react';

const ExerciseModal = ({ 
  exercise, 
  isOpen, 
  onClose 
}) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 568);
    const [activeTab, setActiveTab] = useState('Instructions');
    
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
        videoRef.current?.play();
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 568);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }
    
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, [isOpen]);

      if (!isOpen || !exercise) return null;


    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const modalStyle = {
        position: 'relative',
        background: 'rgb(228, 222, 222)',
        borderRadius: '10px',
        maxWidth: '600px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        overflowY: 'auto',
    };

    return (
        <>
            <div style={overlayStyle}>
                <div style={{
                    ...modalStyle,
                    width: isMobile ? '95vw' : '600px',
                    maxWidth: isMobile ? '95vw' : '600px',
                    margin: isMobile ? '10px' : '0'
                    }}>
                    <button
                        onClick={onClose}
                        style={{ 
                        float: 'right', 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '1.5rem', 
                        position: 'absolute', 
                        top: '8px', 
                        right: '8px', 
                        cursor: 'pointer' 
                        }}
                    >×</button>

                    <div style={{
                        margin: '7px', 
                        background: 'rgb(255, 255, 255)', 
                        borderRadius: '10px', 
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'center' : 'stretch',
                            
                            }}> 
                            
                            <div style={{ 
                                position: 'relative', 
                                width: isMobile ? '85%' : '200px', 
                                height: isMobile ? '85%' : '200px',
                                marginTop: '20px'
                                }}>
                                {/* Image Placeholder */}
                                {!isPlaying && (
                                    <img
                                    src={exercise.imageUrl}
                                    alt={exercise.name}
                                    onClick={handlePlay}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        zIndex: 2,
                                        borderRadius: '12px',
                                    }}
                                    />
                                )}

                                {/* Video Element */}
                                <video
                                    ref={videoRef}
                                    src={exercise.videoUrl}
                                    controls
                                    onPause={handlePause}
                                    onEnded={handlePause}
                                    style={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    objectFit: 'cover',
                                    }}
                                />
                            </div>
                            <div style={{
                                flex: 1, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                marginLeft: isMobile ? '0px' : '-20px',
                                marginBottom: isMobile ? '15px' : '0'
                            }}> 
                                <h4 style={{ 
                                    fontFamily: 'Open Sans, sans-serif', 
                                    marginTop: isMobile ? '10px' : '60px', 
                                    marginBottom: '0px', 
                                    fontWeight: '100', 
                                    fontSize: isMobile ? '20px' : '22px',
                                    textAlign: 'center'
                                    }}>{exercise.name}</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                        {exercise.categories.map((category, index) => (
                                            <p  key={index} 
                                                style={{ 
                                                    padding: '4px 20px', 
                                                    background: 'rgb(34, 226, 217, 0.4)', 
                                                    fontSize: '13px', 
                                                    borderRadius: '15px', 
                                                    margin: '6px 0px'
                                                }}>
                                                {category}
                                            </p>
                                        ))}
                                    </div>
                                
                                <div
                                style={{
                                    height: isMobile ? 'auto' : '4.5em',
                                    overflow: isMobile ? 'visible' : 'hidden',
                                    textOverflow: isMobile ? 'initial' : 'ellipsis',
                                    display: isMobile ? 'block' : '-webkit-box',
                                    WebkitLineClamp: isMobile ? 'none' : 3,
                                    WebkitBoxOrient: isMobile ? 'initial' : 'vertical',
                                    marginTop: '8px',
                                    fontSize: '15px',
                                    lineHeight: '1.5em',
                                    textAlign: 'center',
                                    padding: isMobile ? '0 10px' : '0'
                                }}
                                >
                                "{exercise.description}"
                                </div>

                                {!isMobile && exercise.description.split(' ').length > 30 && (
                                <div
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFullDescription(true);
                                    }}
                                    style={{
                                    marginTop: '0px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: '#007bff',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                    }}
                                >
                                    See more
                                </div>
                                )}
                            </div>
                        </div>
                        
                        
                    </div>
                    <div style={{
                        margin: '7px', 
                        background: 'rgb(255, 255, 255)', 
                        borderRadius: '10px',  
                        minHeight: isMobile ? '200px' : '285px', 
                        maxHeight: isMobile ? '60vh' : 'none',
                        overflowY: 'auto', 
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                    }}> 
                        <div style={{
                            position: 'relative',
                            borderBottom: '2px solid #ccc',
                            display: 'flex',
                            justifyContent: 'center',
                            paddingTop: '10px',
                            flexWrap: isMobile ? 'wrap' : 'nowrap'
                        }}>
                            {['Instructions', 'Diagram'].map((tab) => (
                                <div key={tab} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                        border: 'none',
                                        background: 'none',
                                        color: activeTab === tab ? '#007bff' : '#333',
                                        padding: isMobile ? '8px 2rem' : '8px 3.5rem',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: '0.3s',
                                        position: 'relative',
                                        zIndex: 1,
                                        fontSize: isMobile ? '14px' : '16px'
                                        }}
                                    >
                                    {tab}
                                    </button>
                                    {activeTab === tab && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: -2,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            backgroundColor: '#007bff',
                                            borderRadius: '2px'
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ padding: isMobile ? '0px 15px' : '0px 20px'}}>
                            <style>{`
                                ol li::marker {
                                font-weight: bold;
                                }
                            `}</style>
                            
                            {activeTab === 'Instructions' && (
                                <div style={{ 
                                    padding: '0px 0px', 
                                    wordWrap: 'break-word', 
                                    overflowWrap: 'break-word', 
                                    lineHeight: '1.4'
                                }}>
                                    <ol>
                                        {exercise.instructions.map((item, idx) => (
                                            <li style={{ 
                                                paddingBottom: '1rem', 
                                                maxWidth: 'calc(100% - 20px)',
                                                fontSize: '14px',
                                            }} key={idx}>{item}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {activeTab === 'Diagram' && (
                                <div style={{ 
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '0px 0px', 
                                    wordWrap: 'break-word', 
                                    overflowWrap: 'break-word', 
                                    lineHeight: '1.4'
                                }}>
                                    <img 
                                        src={exercise.diagramUrl}
                                        alt={exercise.name}/>
                                    
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showFullDescription && (
                <div style={{
                    ...overlayStyle,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: isMobile ? '15px 20px' : '20px 30px',
                        borderRadius: '10px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                        maxWidth: isMobile ? '90vw' : '80vw',
                        width: 'fit-content',
                        height: 'auto',
                        position: 'relative',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => setShowFullDescription(false)}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '12px',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                        }}
                        >
                        ×
                        </button>
                        <p style={{ 
                            margin: '15px 0px', 
                            fontSize: isMobile ? '14px' : '16px', 
                            lineHeight: '1.5' 
                        }}>
                        "{exercise.description}"
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExerciseModal;