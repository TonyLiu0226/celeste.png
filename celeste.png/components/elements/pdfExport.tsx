import jsPDF from 'jspdf';
import { Chapter } from '@/app/(protected-pages)/book/[bookid]/actions';

interface PDFExportProps {
    chapters: Chapter[];
    bookTitle?: string;
}

export default function PDFExport({ chapters, bookTitle }: PDFExportProps) {
    const exportToPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const lineHeight = 7;

        chapters.forEach((chapter, index) => {
            if (index > 0) {
                doc.addPage();
            }

            // Add chapter title
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            const titleWidth = doc.getStringUnitWidth(chapter.title) * 24 / doc.internal.scaleFactor;
            const titleX = (pageWidth - titleWidth) / 2;
            doc.text(chapter.title, titleX, 40);

            // Add chapter content
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            const text = chapter.segments.map(s => s.text).join('\n\n');
            
            // Split text into lines that fit the page width
            const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
            
            // Add lines to document
            let yPosition = 60;
            textLines.forEach((line: string) => {
                if (yPosition > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += lineHeight;
            });
        });

        // Download the PDF
        doc.save(`${bookTitle || 'book'}.pdf`);
    };

    return (
        <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-amber-700 text-white rounded-md font-medium hover:bg-amber-800 active:bg-amber-900 transition-colors"
        >
            Export to PDF
        </button>
    );
} 