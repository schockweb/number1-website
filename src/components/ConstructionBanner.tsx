export default function ConstructionBanner() {
  return (
    <div
      role="status"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(1rem, 2.5vw, 1.75rem) 1.25rem',
        background: '#000000', color: '#FFFFFF',
        fontFamily: 'monospace', fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)', fontWeight: 700,
        letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.5,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <span>
        🚧 This website is currently under construction. For enquiries, reach out at{' '}
        <a
          href="mailto:schockweb@gmail.com"
          style={{ color: '#EA580C', textDecoration: 'underline', fontWeight: 800 }}
        >
          schockweb@gmail.com
        </a>
      </span>
    </div>
  );
}
