# NAMASTE-ICD11 Integration Dashboard

## 🏥 Modern Medical Terminology Integration System
 seamlessly integrating traditional Indian medicine (NAMASTE) codes with international ICD-11 TM2 standards, featuring intelligent multilingual search and professional healthcare UI.

***

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Pages & Components](#pages--components)
- [Dependencies](#dependencies)
- [Usage](#usage)
- [Data Structure](#data-structure)


***

## 🎯 Overview

The NAMASTE-ICD11 Integration Dashboard is a **frontend-only prototype** designed for Smart India Hackathon 2025 (SIH25026). It demonstrates seamless integration between traditional Indian medicine terminology and international healthcare standards through an intuitive, modern web interface.

### Key Capabilities
- **Bidirectional Language Search**: Search in Sanskrit, Hindi, or English
- **Real-time Filtering**: Advanced search with multiple criteria
- **Professional Healthcare UI**: Modern, responsive design optimized for medical professionals
- **API Integration Ready**: Complete documentation for healthcare system embedding

---

## ✨ Features

### 🔍 Intelligent Search System
- **Multilingual Support**: Sanskrit (देवनागरी), Hindi, English terminology
- **Bidirectional Translation**: Search "fever" → displays "ज्वर", search "ज्वर" → displays "fever"  
- **Synonym Recognition**: Automatic matching across language variants
- **Real-time Results**: Instant filtering as you type

### 📊 Dashboard Components
- **Metrics Overview**: Real-time statistics on mappings, validations, confidence levels
- **Quick Search**: Fast terminology lookup with visual results
- **Advanced Filters**: Category, confidence level, and multi-field filtering
- **Export Functionality**: CSV download of filtered results

### 🏥 Medical Data Integration
- **NAMASTE Codes**: Traditional Indian medicine terminology
- **ICD-11 TM2 Mapping**: WHO International Classification integration
- **Complete Descriptions**: Full Ayurvedic explanations and modern equivalents
- **Confidence Scoring**: High/Medium/Low validation levels

***

## 🛠 Tech Stack

### Frontend Framework
- **React 18.2+** - Modern functional components with hooks
- **Vite 4.4+** - Lightning-fast build tool and dev server
- **JSX** - Component-based architecture

### Styling & UI
- **Tailwind CSS 3.3+** - Utility-first CSS framework
- **Lucide React 0.263+** - Beautiful, customizable icons
- **Custom CSS Components** - Healthcare-optimized design system

### Development Tools
- **PostCSS** - CSS preprocessing
- **Autoprefixer** - Cross-browser compatibility
- **ES Modules** - Modern JavaScript module system

***

## 🚀 Installation

### Prerequisites
- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/animenzo/ayurConnectSIH
   cd ayurConnect4
   ```

2. **Install Dependencies**
   ```bash
   npm install
   
   ```

3. **Start Development Server**
   ```bash
   npm run dev

   ```

4. **Open Application**
   - Navigate to `http://localhost:5173`
   - Application will auto-reload on file changes


***

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Sidebar.jsx      # Navigation sidebar with menu items
│   ├── Header.jsx       # Top header with search and user controls
│   ├── Dashboard.jsx    # Main dashboard page container
│   ├── MetricsCards.jsx # Statistics overview cards
│   ├── QuickSearch.jsx  # Intelligent search component
│   ├── SearchPage.jsx   # Advanced search page
│   ├── AdvancedFilters.jsx # Multi-criteria filtering
│   ├── ResultsTable.jsx # Data table with detailed modals
│   ├── RecentMappings.jsx # Latest mappings display
│   ├── SystemStatus.jsx # System health monitoring
│   └── ApiDocs.jsx      # API integration documentation
├── data/
│   └── medicalData.js   # Static dataset with 5 NAMASTE-ICD11 mappings
├── App.jsx              # Main application component
├── main.jsx             # React application entry point
└── index.css            # Global styles and Tailwind imports

public/
├── index.html           # HTML template
└── vite.svg            # Application favicon

Configuration Files:
├── package.json         # Dependencies and scripts
├── vite.config.js      # Vite build configuration
├── tailwind.config.js  # Tailwind CSS customization
├── postcss.config.js   # PostCSS configuration
└── README.md           # This file
```

***

## 🧩 Pages & Components

### 🏠 Dashboard Page (`Dashboard.jsx`)
**Main landing page with comprehensive overview**
- **MetricsCards**: Display total mappings (2,847), pending validations (23), NAMASTE codes (5,240), high confidence mappings (2,654)
- **QuickSearch**: Intelligent search with bidirectional language support
- **RecentMappings**: Latest 3 terminology mappings with details
- **SystemStatus**: Real-time system health monitoring

### 🔍 Advanced Search Page (`SearchPage.jsx`)
**Comprehensive search and filtering interface**
- **AdvancedFilters**: Multi-criteria search (term, category, confidence level)
- **ResultsTable**: Paginated results with detailed modal views
- **Export Functionality**: CSV download of filtered results
- **Real-time Updates**: Instant filtering with 300ms debounce

### 📚 API Documentation Page (`ApiDocs.jsx`)
**Complete integration guide for healthcare systems**
- **Getting Started**: Base URL, authentication, response formats
- **Endpoint Documentation**: Search, mapping details, validation APIs
- **Code Examples**: JavaScript integration examples
- **Integration Classes**: Ready-to-use EMR integration code

### 🧭 Navigation Components

#### Sidebar (`Sidebar.jsx`)
- **Menu Items**: Dashboard, Advanced Search, Terminology, Validation, Problem Lists, Administration, API Docs
- **Visual Design**: Modern healthcare theme with NAMASTE-ICD11 branding
- **Active State**: Highlight current page with primary color accent

#### Header (`Header.jsx`)
- **Global Search**: Quick terminology lookup
- **Action Buttons**: Validate Mappings, notifications
- **User Profile**: Admin user controls and settings

***

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",           // React framework
  "react-dom": "^18.2.0",      // React DOM rendering
  "react-icons": "^4.12.0",    // Icon library (backup)
  "lucide-react": "^0.263.1"   // Primary icon system
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.0.3",  // Vite React plugin
  "tailwindcss": "^3.3.3",           // CSS framework
  "postcss": "^8.4.27",              // CSS processing
  "autoprefixer": "^10.4.14",        // CSS prefixing
  "vite": "^4.4.5"                   // Build tool
}
```

### Key Features by Dependency

**React 18.2+**
- Functional components with hooks (useState, useEffect)
- Modern JSX syntax
- Component composition and reusability

**Tailwind CSS 3.3+**
- Utility-first styling approach
- Responsive design system
- Custom healthcare color palette
- Component-level styling patterns

**Lucide React**
- 1000+ beautiful, customizable icons
- Medical and healthcare specific icons
- Consistent design language
- Lightweight SVG icons

**Vite 4.4+**
- Lightning-fast development server
- Hot module replacement (HMR)
- Optimized production builds
- ES module support

---

## 🎮 Usage

### Basic Navigation
1. **Dashboard**: Overview of system metrics and quick search
2. **Advanced Search**: Detailed filtering and export capabilities  
3. **API Documentation**: Integration guide for healthcare systems

### Search Functionality

#### Multilingual Search Examples
```javascript
// Search in English
"fever" → Returns: ज्वर (Jwarah) + ICD-11 TM26.SF20

// Search in Sanskrit  
"ज्वर" → Returns: Fever + detailed Ayurvedic description

// Search in Hindi
"बुखार" → Returns: Complete trilingual mapping

// Search by codes
"EM-1" → Returns: Complete mapping details
"SP57" → Returns: WHO ICD-11 information
```

#### Advanced Filtering
- **Category Filter**: Fever Disorders, Respiratory, Digestive, Metabolic, Musculoskeletal
- **Confidence Level**: High, Medium, Low validation scores
- **Multi-field Search**: Across all terminology fields simultaneously

### Export Data
- Click "Export Results" button on Search page
- Downloads CSV with: NAMASTE Code, Sanskrit Name, English Name, ICD-11 Code, Description, Confidence, Category

***

## 📊 Data Structure

### Medical Mapping Schema
```javascript
{
  id: 1,
  namasteCode: "EM-1",                    // NAMASTE identifier
  namasteName: "JWARAH",                     // Traditional name
  sanskritName: "ज्वर",                      // Sanskrit (Devanagari)
  englishName: "Fever",                      // English equivalent
  hindiName: "बुखार",                        // Hindi name
  icdCode: "SP57",                      // ICD-11 TM2 code
  icdDescription: "Fever disorders...",      // WHO description
  fullDescription: "Complete Ayurvedic...",  // Traditional description
  confidenceLevel: "High",                   // Validation level
  category: "Fever Disorders",               // Medical category
  symptoms: ["Body heat", "Thirst", ...],   // Associated symptoms
  ayurvedicTreatment: "Cooling herbs...",   // Traditional treatment
                 
}
```

### Available Categories
- **Fever Disorders** (Jwarah/ज्वर)
- **Respiratory Disorders** (Kasah/कास) 
- **Digestive Disorders** (Gulmah/गुल्म)
- **Metabolic Disorders** (Madhumeha/मधुमेह)
- **Musculoskeletal Disorders** (Amavata/आमवात)

***

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- **ESLint**: Follow React/JavaScript best practices
- **Component Structure**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Naming**: camelCase for variables, PascalCase for components

