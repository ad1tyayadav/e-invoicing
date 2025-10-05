export const config = {
  // File handling
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['.csv', '.json'],
  
  // AI features
  enableAI: process.env.ENABLE_AI === 'true',
  huggingFaceToken: process.env.HUGGING_FACE_TOKEN,
  
  // Database
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  
  // API limits
  maxRows: 200,
  analysisTimeout: 5000, // 5 seconds
};

// Validation function
export function validateConfig() {
  const errors: string[] = [];
  
  if (!config.supabase.url) errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  if (!config.supabase.anonKey) errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  if (config.enableAI && !config.huggingFaceToken) {
    errors.push('HUGGING_FACE_TOKEN is required when AI is enabled');
  }
  
  return errors;
}