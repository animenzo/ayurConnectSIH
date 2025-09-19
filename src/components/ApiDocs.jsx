import React, { useState } from 'react';
import { Code, Copy, CheckCircle, BookOpen, Globe, Shield } from 'lucide-react';

export default function ApiDocs() {
  const [copiedSection, setCopiedSection] = useState('');
  
  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const codeExamples = {
    search: `// Search NAMASTE-ICD11 mappings
fetch('/api/mappings/search?q=जवर', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`,
    
    mapping: `// Get specific mapping details
fetch('/api/mappings/AYU-001', {
  method: 'GET', 
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(mapping => {
  console.log(mapping.sanskritName); // ज्वर
  console.log(mapping.englishName);  // Fever
  console.log(mapping.icdCode);      // TSP57
});`,

    integration: `// Integration example for EMR systems
class NAMASTEIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.namaste-icd11.org';
  }
  
  async searchByLanguage(term, language = 'auto') {
    const response = await fetch(\`\${this.baseURL}/mappings/search\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        query: term, 
        language: language,
        includeSynonyms: true 
      })
    });
    return response.json();
  }
}`,

    fhirValidation: `// Validate NAMASTE mapping against FHIR resources
fetch('/api/validate/fhir', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    namasteCode: 'EM-1',
    fhirResource: {
      resourceType: 'Condition',
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: '386661006',
          display: 'Fever'
        }]
      }
    }
  })
})
.then(response => response.json())
.then(validation => {
  console.log(validation.isValid); // true/false
  console.log(validation.matchScore); // 0.95
  console.log(validation.suggestions); // Array of matched FHIR codes
});`
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Code className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">API Documentation</h2>
            <p className="text-slate-500">Integrate NAMASTE-ICD11 mappings into your healthcare systems</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <Globe className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Multi-language</h3>
            <p className="text-sm text-slate-600">Sanskrit, Hindi, English support</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <Shield className="w-8 h-8 mx-auto mb-2 text-success-600" />
            <h3 className="font-semibold text-slate-900">Secure API</h3>
            <p className="text-sm text-slate-600">OAuth 2.0 authentication</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-warning-600" />
            <h3 className="font-semibold text-slate-900">Rich Data</h3>
            <p className="text-sm text-slate-600">Complete mapping details</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Getting Started</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Base URL</h4>
            <div className="bg-slate-100 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
              <span>https://api.namaste-icd11.org/v1</span>
              <button 
                onClick={() => copyToClipboard('https://api.namaste-icd11.org/v1', 'baseurl')}
                className="text-slate-500 hover:text-slate-700"
              >
                {copiedSection === 'baseurl' ? <CheckCircle className="w-4 h-4 text-success-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Authentication</h4>
            <p className="text-sm text-slate-600 mb-3">
              All API requests require authentication using OAuth 2.0 Bearer tokens. Include the token in the Authorization header.
            </p>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">// Authentication Header</span>
                <button 
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_ACCESS_TOKEN', 'auth')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedSection === 'auth' ? <CheckCircle className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              Authorization: Bearer YOUR_ACCESS_TOKEN
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">API Endpoints</h3>
        
        <div className="space-y-6">
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-sm font-medium">GET</span>
              <code className="font-mono text-sm">/mappings/search</code>
            </div>
            <p className="text-sm text-slate-600 mb-3">Search NAMASTE-ICD11 mappings with multilingual support</p>
            
            <h5 className="font-medium text-slate-900 mb-2">Parameters</h5>
            <div className="text-sm space-y-1 mb-4">
              <div><code className="bg-slate-100 px-2 py-1 rounded">q</code> - Search query (Sanskrit, Hindi, English)</div>
              <div><code className="bg-slate-100 px-2 py-1 rounded">category</code> - Filter by medical category</div>
              <div><code className="bg-slate-100 px-2 py-1 rounded">confidence</code> - Filter by confidence level</div>
            </div>

            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">// Example: Search for fever in Sanskrit</span>
                <button 
                  onClick={() => copyToClipboard(codeExamples.search, 'search')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedSection === 'search' ? <CheckCircle className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap">{codeExamples.search}</pre>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm font-medium">GET</span>
              <code className="font-mono text-sm">/mappings/{'{code}'}</code>
            </div>
            <p className="text-sm text-slate-600 mb-4">Get detailed information for a specific NAMASTE code</p>

            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">// Get mapping details</span>
                <button 
                  onClick={() => copyToClipboard(codeExamples.mapping, 'mapping')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedSection === 'mapping' ? <CheckCircle className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="whitespace-pre-wrap">{codeExamples.mapping}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">FHIR Validation</h3>
        <p className="text-slate-600 mb-4">Validate NAMASTE-ICD11 mappings against FHIR resources for interoperability with modern healthcare systems.</p>
        
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-sm font-medium">POST</span>
            <code className="font-mono text-sm">/api/validate/fhir</code>
          </div>
          <p className="text-sm text-slate-600 mb-3">Validate a NAMASTE code against FHIR Condition or Observation resources</p>
          
          <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">// Validate NAMASTE mapping against FHIR resources</span>
              <button 
                onClick={() => copyToClipboard(codeExamples.fhirValidation, 'fhir')}
                className="text-slate-400 hover:text-white"
              >
                {copiedSection === 'fhir' ? <CheckCircle className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="whitespace-pre-wrap">{codeExamples.fhirValidation}</pre>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-slate-900 mb-2">FHIR Validation Response</h5>
            <pre className="text-sm font-mono text-slate-700">{`{
  "success": true,
  "isValid": true,
  "matchScore": 0.95,
  "suggestions": [
    {
      "fhirCode": "386661006",
      "system": "http://snomed.info/sct",
      "display": "Fever",
      "confidence": 0.95
    }
  ],
  "namasteMapping": {
    "namasteCode": "EM-1",
    "englishName": "Fever"
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Integration Example</h3>
        <p className="text-slate-600 mb-4">
          Complete integration class for EMR systems with multilingual search capabilities:
        </p>

        <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">// EMR Integration Class</span>
            <button 
              onClick={() => copyToClipboard(codeExamples.integration, 'integration')}
              className="text-slate-400 hover:text-white"
            >
              {copiedSection === 'integration' ? <CheckCircle className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{codeExamples.integration}</pre>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Response Format</h3>
        <p className="text-slate-600 mb-4">All API responses follow this standard format:</p>
        
        <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <pre>{`{
  "success": true,
  "data": {
    "id": 1,
    "namasteCode": "EM-1",
    "namasteName": "JWARAH",
    "sanskritName": "ज्वर",
    "englishName": "Fever",
    "hindiName": "बुखार",
    "icdCode": "SP57",
    "icdDescription": "Fever disorders with heat pattern",
    "fullDescription": "Complete ayurvedic description...",
    "confidenceLevel": "High",
    "category": "Fever Disorders",
    "symptoms": ["Body heat", "Thirst", "Restlessness"],
    "ayurvedicTreatment": "Cooling herbs and treatments...",
    "lastUpdated": ""
  },
  "meta": {
    "totalResults": 1,
    "language": "multilingual"
  }
}`}</pre>
        </div>
      </div>

      <div className="card p-6 bg-primary-50 border-primary-200">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Need Help?</h3>
        <p className="text-primary-700 mb-4">
          For integration support, technical questions, or to request additional features, contact our development team.
        </p>
        <div className="flex flex-wrap gap-4">
          <a 
            href="mailto:support@namaste-icd11.org" 
            className="btn-primary bg-primary-600 hover:bg-primary-700"
          >
            Email Support
          </a>
          <button className="btn-secondary bg-white hover:bg-slate-50">
            View Examples
          </button>
          <button className="btn-secondary bg-white hover:bg-slate-50">
            Download SDK
          </button>
        </div>
      </div>
    </div>
  );
}