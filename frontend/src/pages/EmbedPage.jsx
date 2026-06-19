import ChatWindow from '../components/ChatWindow.jsx';

// Standalone page — used when loading widget.js as an iframe
export default function EmbedPage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <ChatWindow />
    </div>
  );
}
