E-Invoicing Readiness Analyzer --- [Live Link](http://e-1nvoicing.vercel.app)
==============================

A full-stack web tool that analyzes invoice data against the GETS v0.1 standard and provides readiness scores with AI-powered suggestions.

🚀 Features
-----------

### P0 - Required (Complete ✅)

*   **3-step wizard** (Context → Upload → Results)
    
*   **CSV/JSON file parsing** with 200-row limit
    
*   **Field detection & mapping** against GETS schema
    
*   **5 Rule validations** with detailed findings:
    
    *   TOTALS\_BALANCE: total\_excl\_vat + vat\_amount = total\_incl\_vat
        
    *   LINE\_MATH: line\_total = qty × unit\_price
        
    *   DATE\_ISO: YYYY-MM-DD format validation
        
    *   CURRENCY\_ALLOWED: AED, SAR, MYR, USD only
        
    *   TRN\_PRESENT: buyer.trn and seller.trn non-empty
        
*   **Scoring system** with weighted categories:
    
    *   Data Quality: 25%
        
    *   Field Coverage: 35%
        
    *   Rule Validation: 30%
        
    *   Technical Posture: 10%
        
*   **Database persistence** with Supabase PostgreSQL
    
*   **Shareable report URLs** that survive process restarts
    
*   **Professional UI** with table preview, type badges, and score visualization
    

### P1 - Enhanced (Complete ✅)

*   **AI-powered field mapping suggestions** using Hugging Face
    
*   **Human-readable rule explanations** with fix tips
    
*   **PDF export functionality** for professional reports
    
*   **Recent reports list** with quick access to previous analyses
    
*   **Environment-based configuration** for file size and AI features
    
*   **Toast notifications** and comprehensive error handling
    
*   **Fully responsive design** for mobile and desktop
    
*   **Accessible UI** with keyboard navigation support
    

🛠 Tech Stack
-------------

*   **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
    
*   **Backend**: Next.js API Routes with TypeScript
    
*   **Database**: Supabase (PostgreSQL)
    
*   **AI Integration**: Hugging Face Inference API
    
*   **File Processing**: Papa Parse for CSV, native JSON parsing
    
*   **PDF Generation**: jsPDF with html2canvas
    
*   **UI Components**: Custom components with Shadcn/ui inspiration
    
*   **Deployment**: Vercel with environment variables
    

📦 Installation & Setup
-----------------------

### Prerequisites

*   Node.js 18+
    
*   Supabase account
    
*   Hugging Face account (optional, for AI features)


### 1. Clone and Install
```bash
git clone https://github.com/ad1tyayadav/e-invoicing
cd e-invoicing
npm install    
```

### 2. Environment Configuration
```bash
.env.local

# Required
NEXT_PUBLIC_BASE_URL=http://localhost:3000/
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Optional AI Features
HUGGING_FACE_TOKEN=your_hugging_face_token
ENABLE_AI=true

# File Handling
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=.csv,.json
```

### 3. Database Setup
Run this SQL in your Supabase SQL editor:
```bash
-- Uploads table
CREATE TABLE uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  country TEXT,
  erp TEXT,
  rows_parsed INTEGER,
  raw_data TEXT
);

-- Reports table  
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  upload_id UUID REFERENCES uploads(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scores_overall INTEGER,
  report_json JSONB
);

-- Indexes for performance
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_uploads_created_at ON uploads(created_at);
```



### 4. Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.
