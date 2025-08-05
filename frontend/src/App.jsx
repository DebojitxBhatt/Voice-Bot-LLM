import { useState } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [botReply, setBotReply] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setDebugInfo('🎤 Started listening...');
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setDebugInfo(prev => prev + '\n🎤 Stopped listening');
    };

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setDebugInfo(prev => prev + `\n📝 Transcribed: "${text}"`);
      setIsLoading(true);

      try {
        setDebugInfo(prev => prev + '\n🔄 Sending to backend...');
        
        // Call the backend API
        const res = await fetch('http://localhost:3000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        // Get the JSON response
        const data = await res.json();
        setDebugInfo(prev => prev + `\n✅ Backend response received`);
        
        setBotReply(data.message);
        
        // Convert base64 audio data to blob URL
        if (data.audioData) {
          const audioBlob = new Blob([
            Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0))
          ], { type: 'audio/mp3' });
          
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          setDebugInfo(prev => prev + '\n🎵 Audio generated and ready to play');
        }
        
      } catch (error) {
        console.error('Error:', error);
        setDebugInfo(prev => prev + `\n❌ Error: ${error.message}`);
        setBotReply('Sorry, there was an error processing your request.');
      } finally {
        setIsLoading(false);
      }
    };

    recognition.start();
  };

  const clearAll = () => {
    setTranscript('');
    setBotReply('');
    // Clean up the blob URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
    setDebugInfo('');
  };

  return (
    <div style={{ 
      padding: 30, 
      maxWidth: 800, 
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '10px' }}>🎙️ Voice Bot</h1>
      <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
        Click the button below and start talking to get an AI response!
      </p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={startListening} 
          disabled={isListening || isLoading}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: isListening ? '#ff6b6b' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isListening || isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isListening ? '🎤 Listening...' : isLoading ? '⏳ Processing...' : '🎤 Start Talking'}
        </button>
        
        <button 
          onClick={clearAll}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Your Speech */}
      <div style={{ 
        marginBottom: '20px', 
        border: '2px solid #007bff', 
        borderRadius: '10px', 
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#007bff', fontWeight: 'bold' }}>🎤 Your Speech:</h3>
        {transcript ? (
          <p style={{ 
            padding: '15px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '8px',
            border: '2px solid #007bff',
            fontSize: '16px',
            margin: 0,
            fontWeight: 'bold',
            color: '#1565c0'
          }}>
            "{transcript}"
          </p>
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>No speech detected yet...</p>
        )}
      </div>

      {/* Bot's Response */}
      <div style={{ 
        marginBottom: '20px', 
        border: '2px solid #28a745', 
        borderRadius: '10px', 
        padding: '20px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#28a745', fontWeight: 'bold' }}>🤖 Bot's Response:</h3>
        {botReply ? (
          <p style={{ 
            padding: '15px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px',
            border: '2px solid #28a745',
            fontSize: '16px',
            margin: 0,
            lineHeight: '1.5',
            color: '#155724',
            fontWeight: '500'
          }}>
            "{botReply}"
          </p>
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>
            {isLoading ? '⏳ Processing your request...' : 'No response yet...'}
          </p>
        )}
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div style={{ 
          marginBottom: '20px', 
          border: '2px solid #ffc107', 
          borderRadius: '10px', 
          padding: '20px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ff8f00', fontWeight: 'bold' }}>🔊 Audio Response:</h3>
          <audio 
            src={audioUrl} 
            controls 
            autoPlay 
            style={{ width: '100%', marginTop: '10px' }}
          />
        </div>
      )}

      {/* Debug Information */}
      <details style={{ marginTop: '30px' }}>
        <summary style={{ 
          cursor: 'pointer', 
          color: '#666',
          fontWeight: 'bold',
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: '5px',
          border: '1px solid #ddd'
        }}>
          🔧 Debug Information
        </summary>
        <pre style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '5px', 
          border: '1px solid #ddd',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          maxHeight: '200px',
          overflow: 'auto',
          color: '#333',
          marginTop: '10px'
        }}>
          {debugInfo || 'No debug info yet...'}
        </pre>
      </details>
    </div>
  );
}

export default App;
