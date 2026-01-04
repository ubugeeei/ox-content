interface AlertProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children?: React.ReactNode;
}

const colors = {
  info: { bg: '#1e3a5f', border: '#3b82f6' },
  warning: { bg: '#422006', border: '#f59e0b' },
  error: { bg: '#450a0a', border: '#ef4444' },
  success: { bg: '#052e16', border: '#22c55e' },
};

export default function Alert({ type = 'info', title, children }: AlertProps) {
  const color = colors[type];

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '0.5rem',
        margin: '1rem 0',
        background: color.bg,
        borderLeft: `4px solid ${color.border}`,
      }}
    >
      {title && <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{title}</strong>}
      {children}
    </div>
  );
}
