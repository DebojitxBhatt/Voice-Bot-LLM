import { useState, useEffect, useRef } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [botReply, setBotReply] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const animationRef = useRef(null);

  // Visual feedback animation for listening
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setAudioLevel(Math.random() * 100);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevel(0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  // Auto-restart listening after audio finishes
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        setIsSpeaking(false);
        setTimeout(() => {
          startListening();
        }, 1000);
      };

      audioRef.current.addEventListener('ended', handleEnded);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioUrl]);

  // Auto-start listening when app loads
  useEffect(() => {
    // Small delay to ensure everything is initialized
    const timer = setTimeout(() => {
      startListening();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const startListening = () => {
    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Check browser compatibility
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('Started listening...');
      setIsListening(true);
      setIsThinking(false);
      setIsSpeaking(false);
    };

    recognition.onend = () => {
      console.log('Stopped listening...');
      setIsListening(false);
    };
    recognition.onresult = async (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      // Process final result
      if (finalTranscript) {
        console.log('Processing final transcript:', finalTranscript);
        setTranscript(finalTranscript);
        setIsThinking(true);
        setIsListening(false);

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: finalTranscript }),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          const data = await res.json();
          setBotReply(data.message);

          // Add to conversation history
          const newEntry = {
            user: finalTranscript,
            bot: data.message,
            timestamp: new Date().toISOString()
          };
          setConversationHistory(prev => [...prev, newEntry]);

          // Convert base64 audio data to blob URL
          if (data.audioData) {
            const audioBlob = new Blob([
              Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0))
            ], { type: 'audio/mp3' });
            
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            setIsSpeaking(true);
            setIsThinking(false);
          }

        } catch (error) {
          console.error('Error:', error);
          setBotReply('Sorry, there was an error processing your request.');
          setIsThinking(false);
          // Restart listening after error
          setTimeout(() => {
            startListening();
          }, 2000);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsThinking(false);
      // Restart listening after error
      setTimeout(() => {
        startListening();
      }, 2000);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      // Retry after a delay
      setTimeout(() => {
        startListening();
      }, 2000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsAudioPlaying(false);
  };

  // Add audio event listeners to track playing state
  useEffect(() => {
    if (audioRef.current) {
      const handlePlay = () => setIsAudioPlaying(true);
      const handlePause = () => setIsAudioPlaying(false);
      const handleEnded = () => setIsAudioPlaying(false);
      
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current.removeEventListener('pause', handlePause);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioUrl]);

  const resetConversation = () => {
    setTranscript('');
    setBotReply('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setConversationHistory([]);
    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
    stopListening();
    setTimeout(() => {
      startListening();
    }, 500);
  };

  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (isThinking) return 'Thinking...';
    if (isSpeaking) return 'Speaking...';
    return 'Ready - Click to start';
  };

  const getButtonIcon = () => {
    if (isListening) return '🎤';
    if (isThinking) return '⏳';
    if (isSpeaking) return '🔊';
    return '🎤';
  };

  const getButtonColor = () => {
    if (isListening) return '#ef4444';
    if (isThinking) return '#f59e0b';
    if (isSpeaking) return '#10a37f';
    return '#6b7280'; // Gray when ready
  };

  const handleButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Twitter blue
  const twitterBlue = '#343541';
  const twitterBlueDark = '#40414f';

  return (
    <div style={{ 
      backgroundColor: twitterBlue,
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      color: '#fff',
      textAlign: 'center',
      padding: '0 8px', // Mobile padding
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'transparent',
        borderBottom: 'none',
        padding: '12px 0 0 0',
        textAlign: 'center',
        boxShadow: 'none',
        width: '100%',
        margin: 0,
      }}>
        <h1 style={{ 
          color: '#fff', 
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600',
          letterSpacing: '-0.025em',
          textShadow: '0 2px 8px #0a75c2'
        }}>
          Voice Bot
        </h1>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0 4px',
      }}>
        {/* Voice Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          width: '100%',
        }}>
          <button 
            onClick={handleButtonClick}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: '3px solid #fff',
              backgroundColor: twitterBlueDark,
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isListening ? 
                `0 0 20px #fff8` : 
                '0 2px 12px #0a75c2',
              animation: isListening ? 'pulse 1.5s infinite' : 'none',
              transform: isListening ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {getButtonIcon()}
          </button>

          {/* Status Text */}
          <p style={{ 
            color: '#fff', 
            fontSize: '0.8rem',
            margin: '10px 0 0 0',
            fontWeight: '500',
            letterSpacing: '0.025em',
            textShadow: '0 2px 8px #0a75c2'
          }}>
            {getStatusText()}
          </p>
        </div>

        {/* Live Transcription */}
        {transcript && (
          <div style={{
            backgroundColor: twitterBlueDark,
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '10px',
            width: '100%',
            maxWidth: '350px',
            boxShadow: '0 2px 8px #0a75c2',
            border: '1px solid #fff',
            color: '#fff',
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: '600', color: '#fff', marginBottom: '6px', fontSize: '0.7rem' }}>
              You said:
            </div>
            <div style={{ 
              color: '#fff', 
              fontSize: '0.8rem',
              lineHeight: '1.3',
              fontWeight: '400',
              wordBreak: 'break-word',
            }}>
              "{transcript}"
            </div>
          </div>
        )}

        {/* AI Response */}
        {botReply && (
          <div style={{
            backgroundColor: twitterBlueDark,
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '10px',
            width: '100%',
            maxWidth: '350px',
            boxShadow: '0 2px 8px #0a75c2',
            border: '1px solid #fff',
            color: '#fff',
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: '600', color: '#fff', marginBottom: '6px', fontSize: '0.7rem' }}>
              Assistant:
            </div>
            <div style={{ 
              color: '#fff', 
              fontSize: '0.8rem',
              lineHeight: '1.3',
              marginBottom: '10px',
              fontWeight: '400',
              wordBreak: 'break-word',
            }}>
              "{botReply}"
            </div>
            
            {audioUrl && (
              <>
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  autoPlay 
                  style={{ 
                    display: 'none' // Hide the audio element but keep it functional
                  }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '6px'
                }}>
                  <span 
                    onClick={toggleAudio}
                    style={{
                      fontSize: '16px',
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {isAudioPlaying ? '⏸️' : '▶️'}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#fff',
                    opacity: 0.8
                  }}>
                    {isAudioPlaying ? 'Playing...' : 'Click to play'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div style={{
            width: '100%',
            maxWidth: '350px',
            maxHeight: '250px',
            overflowY: 'auto',
            backgroundColor: twitterBlueDark,
            borderRadius: '10px',
            padding: '12px',
            boxShadow: '0 2px 8px #0a75c2',
            border: '1px solid #fff',
            color: '#fff',
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: '600', color: '#fff', marginBottom: '10px', fontSize: '0.8rem' }}>
              Conversation History
            </div>
            {conversationHistory.map((entry, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div style={{
                  backgroundColor: twitterBlue,
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '6px',
                  border: '1px solid #fff',
                  color: '#fff',
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: '600', color: '#fff', marginBottom: '3px', fontSize: '0.65rem' }}>
                    You
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.7rem', lineHeight: '1.2', wordBreak: 'break-word' }}>
                    {entry.user}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: twitterBlue,
                  borderRadius: '8px',
                  padding: '8px',
                  border: '1px solid #fff',
                  color: '#fff',
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: '600', color: '#fff', marginBottom: '3px', fontSize: '0.65rem' }}>
                    Assistant
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.7rem', lineHeight: '1.2', wordBreak: 'break-word' }}>
                    {entry.bot}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div style={{
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: 10,
      }}>
        <button 
          onClick={resetConversation}
          style={{
            padding: '4px 8px',
            fontSize: '0.7rem',
            backgroundColor: twitterBlueDark,
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            boxShadow: '0 2px 6px #0a75c2',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fff';
            e.target.style.color = twitterBlueDark;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = twitterBlueDark;
            e.target.style.color = '#fff';
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;