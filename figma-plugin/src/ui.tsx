import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './ui.css';

function App() {
    const [activeTab, setActiveTab] = React.useState<'url' | 'brand'>('brand');
    const [url, setUrl] = React.useState('');
    const [brandKey, setBrandKey] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    React.useEffect(() => {
        window.onmessage = (event) => {
            const { type, message } = event.data.pluginMessage;
            if (type === 'status') {
                setMessage({ type: 'info', text: message });
            } else if (type === 'success') {
                setMessage({ type: 'success', text: message });
                setLoading(false);
            } else if (type === 'error') {
                setMessage({ type: 'error', text: message });
                setLoading(false);
            }
        };
    }, []);

    const handleAnalyzeUrl = () => {
        if (!url) return;
        setLoading(true);
        setMessage(null);
        parent.postMessage({ pluginMessage: { type: 'generate-personas', url } }, '*');
    };

    const handleImportBrand = async () => {
        if (!brandKey) return;
        setLoading(true);
        setMessage(null);

        try {
            // Fetch manifest from Flowtusk API
            // Note: In production, you might want to proxy this through the plugin code if CORS is an issue,
            // but Figma plugins run in a browser-like environment that usually allows fetch.
            // However, Figma's 'code.ts' has better network privileges for some things.
            // For now, we'll fetch here and pass data, or pass key to code.ts.
            // Let's pass key to code.ts to keep logic centralized.

            // Actually, fetching in UI is often easier for CORS if the API supports it.
            // Let's try fetching here first.
            const response = await fetch(`http://localhost:3000/api/brand-manifest/${brandKey}`);

            if (!response.ok) {
                throw new Error('Brand Key not found or invalid.');
            }

            const data = await response.json();

            parent.postMessage({
                pluginMessage: {
                    type: 'import-manifest',
                    manifest: data.manifest
                }
            }, '*');

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'url' ? 'active' : ''}`}
                    onClick={() => setActiveTab('url')}
                >
                    Analyze URL
                </button>
                <button
                    className={`tab ${activeTab === 'brand' ? 'active' : ''}`}
                    onClick={() => setActiveTab('brand')}
                >
                    Import Brand
                </button>
            </div>

            <div className="content">
                {activeTab === 'url' ? (
                    <div className="tab-content">
                        <h3>Generate Personas</h3>
                        <p className="hint">Paste a website URL to generate personas and fill your template.</p>
                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="input"
                        />
                        <button
                            onClick={handleAnalyzeUrl}
                            disabled={loading || !url}
                            className="button primary"
                        >
                            {loading ? 'Analyzing...' : 'Generate Personas'}
                        </button>
                    </div>
                ) : (
                    <div className="tab-content">
                        <h3>Import Brand System</h3>
                        <p className="hint">Paste your Brand Key from Flowtusk Design Studio.</p>
                        <input
                            type="text"
                            placeholder="FLOW-XXXX"
                            value={brandKey}
                            onChange={(e) => setBrandKey(e.target.value)}
                            className="input"
                        />
                        <button
                            onClick={handleImportBrand}
                            disabled={loading || !brandKey}
                            className="button brand"
                        >
                            {loading ? 'Importing...' : 'Import Brand System'}
                        </button>
                    </div>
                )}

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('react-page') as HTMLElement);
root.render(<App />);
