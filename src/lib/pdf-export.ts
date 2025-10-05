/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';

export function generateSimplePDF(report: any, reportId: string) {
  const pdf = new jsPDF();
  
  // Set initial position
  let yPosition = 20;
  
  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 128); // Blue color
  pdf.text('E-Invoicing Readiness Report', 20, yPosition);
  yPosition += 15;
  
  // Report ID and Date
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Report ID: ${report.reportId} | Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
  yPosition += 10;
  
  if (report.meta.aiEnabled) {
    pdf.setTextColor(128, 0, 128); // Purple for AI
    pdf.text('AI-Powered Analysis', 20, yPosition);
    yPosition += 10;
  }
  
  // Overall Score
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Overall Readiness Score: ${report.scores.overall}%`, 20, yPosition);
  yPosition += 15;
  
  // Detailed Scores
  pdf.setFontSize(12);
  pdf.text('Detailed Scores:', 20, yPosition);
  yPosition += 8;
  
  const scores = [
    `Data Quality: ${report.scores.data}% (Weight: 25%)`,
    `Field Coverage: ${report.scores.coverage}% (Weight: 35%)`,
    `Rule Validation: ${report.scores.rules}% (Weight: 30%)`,
    `Technical Posture: ${report.scores.posture}% (Weight: 10%)`
  ];
  
  scores.forEach(score => {
    pdf.text(score, 25, yPosition);
    yPosition += 7;
  });
  
  yPosition += 10;
  
  // Field Coverage Summary
  pdf.text('Field Coverage Summary:', 20, yPosition);
  yPosition += 8;
  pdf.text(`Matched Fields: ${report.coverage.matched.length}`, 25, yPosition);
  yPosition += 7;
  pdf.text(`Close Matches: ${report.coverage.close.length}`, 25, yPosition);
  yPosition += 7;
  pdf.text(`Missing Fields: ${report.coverage.missing.length}`, 25, yPosition);
  yPosition += 15;
  
  // AI Suggestions
  if (report.coverage.close.length > 0) {
    pdf.setTextColor(0, 0, 128); // Blue for AI section
    pdf.text('AI Field Mapping Suggestions:', 20, yPosition);
    yPosition += 8;
    pdf.setTextColor(0, 0, 0);
    
    report.coverage.close.forEach((match: any, index: number) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`${match.candidate} → ${match.target} (${Math.round(match.confidence * 100)}% match)`, 25, yPosition);
      yPosition += 7;
      
      if (match.suggestion) {
        pdf.setFontSize(10);
        pdf.text(`   💡 ${match.suggestion}`, 25, yPosition);
        yPosition += 7;
        pdf.setFontSize(12);
      }
      yPosition += 3;
    });
    
    yPosition += 10;
  }
  
  // Rule Findings
  pdf.text('Rule Validation Results:', 20, yPosition);
  yPosition += 8;
  
  report.ruleFindings.forEach((finding: any, index: number) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    const status = finding.ok ? 'PASS' : 'FAIL';
    const color = finding.ok ? [0, 128, 0] : [255, 0, 0]; // Green or Red
    
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(`${finding.rule}: ${status}`, 25, yPosition);
    yPosition += 7;
    
    if (!finding.ok && finding.explanation) {
      pdf.setTextColor(128, 128, 0); // Yellow for explanations
      pdf.setFontSize(10);
      pdf.text(`   🔧 ${finding.explanation}`, 25, yPosition);
      yPosition += 7;
      pdf.setFontSize(12);
    }
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 3;
  });
  
  // Save the PDF
  pdf.save(`invoice-readiness-report-${reportId}.pdf`);
}