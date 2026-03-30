import { useState } from 'react';
import { ExternalLink, Loader } from 'lucide-react';

const MY_APP_URL = 'https://confidotool.netlify.app/';

export default function MyApp() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 40px)' }}>
      {/* Label bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #E5E5E5',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#9CA3AF', background: '#F3F4F6', borderRadius: 5, padding: '3px 9px',
          }}>
            External App
          </span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{MY_APP_URL}</span>
        </div>
        <a
          href={MY_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: '#6B7280', textDecoration: 'none',
            border: '1px solid #E5E5E5', borderRadius: 5, padding: '4px 10px',
          }}
        >
          Open in new tab <ExternalLink size={11} />
        </a>
      </div>

      {/* Iframe wrapper */}
      <div style={{ flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E5E5', minHeight: 500 }}>
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, background: '#F9FAFB',
          }}>
            <Loader size={24} color="#4CAF7D" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>Loading app…</span>
          </div>
        )}
        <iframe
          src={MY_APP_URL}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            minHeight: 600,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
          title="External App"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
