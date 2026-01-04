import { useState } from 'react';

interface CounterProps {
  start?: number;
}

export default function Counter({ start = 0 }: CounterProps) {
  const [count, setCount] = useState(start);

  return (
    <div className="counter">
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <span className="count">{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <style>{`
        .counter {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #333;
          border-radius: 0.5rem;
          background: #1a1a1a;
        }
        .count {
          min-width: 2rem;
          text-align: center;
          font-weight: 600;
          color: #fff;
        }
        .counter button {
          padding: 0.25rem 0.75rem;
          border: none;
          border-radius: 0.25rem;
          background: #ff6b35;
          color: white;
          cursor: pointer;
        }
        .counter button:hover {
          background: #e85d2c;
        }
      `}</style>
    </div>
  );
}
