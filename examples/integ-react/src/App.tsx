// Import Markdown document as React component
import IndexDoc from '../docs/index.md';

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>🦀 Ox Content + React</h1>
        <p>Embed React components directly in Markdown</p>
      </header>
      <main>
        <IndexDoc />
      </main>
    </div>
  );
}
