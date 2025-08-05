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
          const res = await fetch('http://localhost:3000/chat', {
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

  return (
    <div style={{ 
      backgroundColor: '#f7f7f8',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e5e5',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: '#202123', 
          margin: 0,
          fontSize: '28px',
          fontWeight: '600'
        }}>
          AI Voice Assistant
        </h1>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        
        {/* Voice Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <button 
            onClick={handleButtonClick}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: getButtonColor(),
              color: 'white',
              fontSize: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              transition: 'all 0.3s ease',
              boxShadow: isListening ? 
                `0 0 30px ${getButtonColor()}40` : 
                '0 4px 20px rgba(0,0,0,0.15)',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {getButtonIcon()}
          </button>

          {/* Status Text */}
          <p style={{ 
            color: '#6e6e80', 
            fontSize: '18px',
            margin: '20px 0 0 0',
            fontWeight: '500'
          }}>
            {getStatusText()}
          </p>

          {/* Audio Level Visualization */}
          {isListening && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              marginTop: '20px'
            }}>
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: `${30 + (audioLevel * 0.4 * (i + 1))}px`,
                    backgroundColor: '#10a37f',
                    borderRadius: '3px',
                    transition: 'height 0.1s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Current Speech Display */}
        {transcript && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5'
          }}>
            <div style={{ fontWeight: '600', color: '#202123', marginBottom: '8px', fontSize: '14px' }}>
              You said:
            </div>
            <div style={{ 
              color: '#374151', 
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              "{transcript}"
            </div>
          </div>
        )}

        {/* Bot Response Display */}
        {botReply && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5'
          }}>
            <div style={{ fontWeight: '600', color: '#202123', marginBottom: '8px', fontSize: '14px' }}>
              Assistant:
            </div>
            <div style={{ 
              color: '#374151', 
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '12px'
            }}>
              "{botReply}"
            </div>
            
            {audioUrl && (
              <audio 
                ref={audioRef}
                src={audioUrl} 
                controls 
                autoPlay 
                style={{ width: '100%' }}
              />
            )}
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5'
          }}>
            <div style={{ fontWeight: '600', color: '#202123', marginBottom: '16px', fontSize: '16px' }}>
              Conversation History:
            </div>
            {conversationHistory.map((entry, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <div style={{
                  backgroundColor: '#f7f7f8',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ fontWeight: '600', color: '#202123', marginBottom: '4px', fontSize: '12px' }}>
                    You
                  </div>
                  <div style={{ color: '#374151', fontSize: '14px' }}>
                    {entry.user}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ fontWeight: '600', color: '#202123', marginBottom: '4px', fontSize: '12px' }}>
                    Assistant
                  </div>
                  <div style={{ color: '#374151', fontSize: '14px' }}>
                    {entry.bot}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Info (for troubleshooting) */}
        <details style={{ 
          marginTop: '20px',
          maxWidth: '600px',
          width: '100%'
        }}>
          <summary style={{ 
            cursor: 'pointer', 
            color: '#666',
            fontWeight: '500',
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e5e5'
          }}>
            🔧 Debug Info
          </summary>
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e5e5e5',
            marginTop: '8px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div>Listening: {isListening ? '✅' : '❌'}</div>
            <div>Thinking: {isThinking ? '✅' : '❌'}</div>
            <div>Speaking: {isSpeaking ? '✅' : '❌'}</div>
            <div>Audio URL: {audioUrl ? '✅' : '❌'}</div>
            <div>Transcript: "{transcript}"</div>
            <div>Bot Reply: "{botReply}"</div>
          </div>
        </details>
      </div>

      {/* Reset Button */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px'
      }}>
        <button 
          onClick={resetConversation}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
