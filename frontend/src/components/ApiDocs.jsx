import React, { useState } from 'react';
import {
  Code, Copy, CheckCircle, Shield, Terminal, Zap, Activity,
  Play, RefreshCw, Search, Database, AlertCircle, FileJson, Key
} from 'lucide-react';
import ApiKeyGenerator from './ApiKeyGenerator';

export default function ApiDocs() {
  const [copiedSection, setCopiedSection] = useState('');
  const [testQuery, setTestQuery] = useState('Kasa');

  // NEW: State to hold the user's pasted API Key
  const [apiKey, setApiKey] = useState('');

  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const handleTestApi = async () => {
    // 1. Prevent testing if they haven't pasted a key
    if (!apiKey.trim()) {
      setApiResponse({ error: "Missing API Key. Please paste your key in the header field above." });
      return;
    }

    setIsLoading(true);
    try {
      // 2. Use the dynamic apiKey state instead of the hardcoded one
      const response = await fetch(`https://ayurconnect-portal.onrender.com/api/v1/mappings/search?q=${testQuery}`, {
        headers: { 'x-api-key': apiKey.trim() }
      });
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ error: "Failed to connect to local server. Ensure backend is running on port 5000." });
    } finally {
      setIsLoading(false);
    }
  };

  const codeExamples = {
    search: `// GET: Multilingual search for Ayurvedic terms
fetch('https://ayurconnect-portal.onrender.com/v1/mappings/search?q=${testQuery}', {
  headers: {
    'x-api-key': 'YOUR_PRODUCTION_KEY',
    'Content-Type': 'application/json'
  }
})`,

    fhir: `// GET: Retrieve an HL7 FHIR ConceptMap for a NAMASTE code
fetch('https://ayurconnect-portal.onrender.com/v1/mappings/SA71/fhir', {
  headers: { 'x-api-key': 'YOUR_PRODUCTION_KEY' }
})`,

    fhirVerify: `// POST: Verify our output using the official public HL7 HAPI server
fetch('http://hapi.fhir.org/baseR4/ConceptMap/$validate', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/fhir+json'
  },
  body: JSON.stringify(namasteApiResponse) 
})
.then(res => res.json())
.then(outcome => console.log(outcome.text.div));`
  };

  const responseSchemas = {
    searchSuccess: `{
  "status": "success",
  "results": 1,
  "data": [
    {
      "namc_code": "SA71",
      "name_english": "Cough",
      "name_devanagari": "कास",
      "icd11_linked": true,
      "icd11_code": "MD21",
      "confidence": "High"
    }
  ]
}`,
    fhirSuccess: `{
  "resourceType": "ConceptMap",
  "id": "namaste-to-icd11-SA71",
  "url": "https://namaste.ayush.gov.in/fhir/ConceptMap/SA71",
  "status": "active",
  "sourceUri": "http://namaste.ayush.gov.in/codes",
  "targetUri": "http://id.who.int/icd/release/11/mms",
  "group": [
    {
      "element": [ { "code": "SA71", "display": "कास (Cough)" } ],
      "target": [ { "code": "MD21", "display": "Cough", "equivalence": "equivalent" } ]
    }
  ]
}`
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500 p-4">
      {/* Hero Header */}
      <div className="card p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs font-bold uppercase">
            <Zap className="w-3 h-3" /> v1.0.0 Stable
          </div>
          <h1 className="text-4xl font-bold tracking-tight">NAMASTE Developer Portal</h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            The clinical bridge between Ayurvedic terminology and global ICD-11 standards. High-performance, FHIR-compliant, and built for modern EMRs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Documentation (Unchanged) */}
        <div className="lg:col-span-7 space-y-8">

          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary-600" />
              <h3 className="text-xl font-bold text-slate-800">Authentication</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">All API requests require an API key to be sent in the header. Requests without authentication will fail with a <code className="text-rose-500 bg-rose-50 px-1 rounded">401</code> status.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm flex justify-between items-center">
              <span className="text-slate-700 font-semibold">x-api-key: <span className="text-primary-600">YOUR_API_KEY</span></span>
              <button onClick={() => copyToClipboard('x-api-key: YOUR_KEY', 'key')} className="text-slate-400 hover:text-slate-600">
                {copiedSection === 'key' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary-600" />
              <h3 className="text-xl font-bold text-slate-800">API Endpoints</h3>
            </div>

            {/* SEARCH ENDPOINT */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black italic">GET</span>
                  <code className="text-sm font-bold text-slate-800">/mappings/search</code>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-slate-600 font-medium">Query our database with Sanskrit, Devanagari, or English clinical names to retrieve standard JSON mappings.</p>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-slate-400" /> Query Parameters</h4>
                  <div className="overflow-hidden border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 font-medium">Parameter</th>
                          <th className="px-4 py-2 font-medium">Type</th>
                          <th className="px-4 py-2 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary-600 font-semibold">q <span className="text-rose-500" title="Required">*</span></td>
                          <td className="px-4 py-3 text-slate-500">string</td>
                          <td className="px-4 py-3 text-slate-600">The medical term to search.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-700 font-semibold">limit</td>
                          <td className="px-4 py-3 text-slate-500">integer</td>
                          <td className="px-4 py-3 text-slate-600">Max results. Default: 10. Max: 100.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Request</span>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-blue-300 h-full">
                      <pre className="whitespace-pre-wrap">{codeExamples.search}</pre>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><FileJson className="w-3 h-3" /> Response (200 OK)</span>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-[10px] text-slate-700 h-full overflow-y-auto max-h-[150px]">
                      <pre>{responseSchemas.searchSuccess}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FHIR ENDPOINT */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-8">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black italic">GET</span>
                  <code className="text-sm font-bold text-slate-800">/mappings/:code/fhir</code>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                  <Activity className="w-3 h-3" /> HL7 FHIR R4 Compliant
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-slate-600 font-medium">
                  Retrieve a strictly formatted FHIR <code className="text-primary-600 bg-primary-50 px-1 rounded">ConceptMap</code> resource, ready for direct ingestion by Epic, Cerner, or other modern EMRs.
                </p>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Code className="w-4 h-4 text-slate-400" /> Path Parameters</h4>
                  <div className="overflow-hidden border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 font-medium">Parameter</th>
                          <th className="px-4 py-2 font-medium">Type</th>
                          <th className="px-4 py-2 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-4 py-3 font-mono text-primary-600 font-semibold">code <span className="text-rose-500" title="Required">*</span></td>
                          <td className="px-4 py-3 text-slate-500">string</td>
                          <td className="px-4 py-3 text-slate-600">The specific NAMASTE Ayurvedic ID (e.g., <code className="bg-slate-100 px-1">SA71</code>).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Request</span>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-blue-300 h-full">
                      <pre className="whitespace-pre-wrap">{codeExamples.fhir}</pre>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><FileJson className="w-3 h-3" /> Response (200 OK)</span>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-[10px] text-slate-700 h-full overflow-y-auto max-h-[150px]">
                      <pre>{responseSchemas.fhirSuccess}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Console */}
        <div className="lg:col-span-5">
          <div className='mb-10'>
            <ApiKeyGenerator />
          </div>

          <div className="sticky top-8 space-y-6">
            <div className="card border-slate-900 bg-slate-900 shadow-2xl overflow-hidden min-h-[500px] flex flex-col rounded-2xl">

              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-widest">Live API Explorer</span>
                </div>
                {isLoading && <RefreshCw className="w-4 h-4 text-primary-400 animate-spin" />}
              </div>

              <div className="p-6 flex-1 flex flex-col space-y-5">

                {/* NEW: API Key Input Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary-400 uppercase flex items-center gap-1">
                    <Key className="w-3 h-3" /> Header: x-api-key
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Paste your generated API key here..."
                  />
                </div>

                {/* Search Query Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Search Query (q)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="e.g. Kasa"
                    />
                    <button
                      onClick={handleTestApi}
                      disabled={isLoading}
                      className="absolute right-2 top-2 p-1.5 bg-primary-600 hover:bg-primary-500 rounded-md text-white transition-colors"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                  </div>
                </div>

                {/* JSON Response Area */}
                <div className="flex-1 bg-black/40 rounded-lg p-4 font-mono text-[11px] overflow-auto border border-slate-800">
                  <div className="text-slate-500 mb-2">// Response Output</div>
                  {apiResponse ? (
                    <pre className={`leading-relaxed ${apiResponse.error ? 'text-rose-400' : 'text-green-400'}`}>
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-600 italic">Enter your API key and term, then click play...</div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-800/30 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Method: GET</span>
                <span>Status: {apiResponse ? (apiResponse.error ? 'Error' : '200 OK') : '--'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}