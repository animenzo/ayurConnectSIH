import React, { useState } from 'react';
import { Key, Building2, Mail, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ApiKeyGenerator() {
  const [formData, setFormData] = useState({ organizationName: '', email: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [generatedKey, setGeneratedKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Your exact logic, upgraded to use React State instead of an alert!
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/developers/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          email: formData.email
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setGeneratedKey(data.apiKey);
        setStatus('success');
      } else {
        setErrorMessage(data.error || 'Failed to generate API key.');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Network error. Ensure the server is running.');
      setStatus('error');
    }
  };

  return (
    <div className="card max-w-md mx-auto bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Key className="w-5 h-5 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Get Production Access</h2>
        </div>
        <p className="text-sm text-slate-400">Generate a unique API key for your EMR integration.</p>
      </div>

      <div className="p-6">
        {status === 'success' ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-success-500/10 border border-success-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-success-400 mb-1">Key Generated Successfully!</h3>
                  <p className="text-xs text-slate-400">Please copy this key now. For security reasons, we will never show it to you again.</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="w-full bg-black/50 border border-slate-700 rounded-lg p-4 font-mono text-sm text-green-400 break-all pr-12">
                {generatedKey}
              </div>
              <button 
                onClick={copyToClipboard}
                className="absolute right-2 top-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button 
              onClick={() => { setStatus('idle'); setFormData({ organizationName: '', email: '' }); }}
              className="w-full py-3 text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              Generate Another Key
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerateKey} className="space-y-5">
            {status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  name="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Apollo Hospitals"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Developer Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="it@apollo.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold transition-all disabled:opacity-70"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating Secure Key...</>
              ) : (
                'Generate API Key'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}