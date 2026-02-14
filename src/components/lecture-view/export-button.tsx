"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Copy, Check } from "lucide-react";
import { jsPDF } from "jspdf";
import { TranscriptSegment, LectureSummary } from "@/lib/types";

interface ExportButtonProps {
    lectureTitle: string;
    lectureCourse: string;
    lectureProfessor: string;
    transcript: TranscriptSegment[];
    summary: LectureSummary;
}

export function ExportButton({
    lectureTitle,
    lectureCourse,
    lectureProfessor,
    transcript,
    summary,
}: ExportButtonProps) {
    const [copied, setCopied] = useState(false);

    const generateMarkdown = () => {
        let md = `# ${lectureTitle}\n\n`;
        md += `**Course:** ${lectureCourse}  \n`;
        md += `**Professor:** ${lectureProfessor}\n\n`;
        md += `## Summary\n\n${summary.executiveSummary}\n\n`;
        md += `## Key Topics\n\n`;
        summary.keyTopics.forEach(({ topic }) => {
            md += `- ${topic}\n`;
        });
        md += `\n## Definitions\n\n`;
        summary.definitions.forEach(({ term, definition }) => {
            md += `**${term}:** ${definition}\n\n`;
        });
        md += `## Transcript\n\n`;
        transcript.forEach(({ speaker, text, start }) => {
            md += `**[${start}s] ${speaker || 'Speaker'}:** ${text}\n\n`;
        });
        return md;
    };

    const handleCopyMarkdown = () => {
        const markdown = generateMarkdown();
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        let y = 20;

        // Title
        doc.setFontSize(18);
        doc.text(lectureTitle, 20, y);
        y += 10;

        // Metadata
        doc.setFontSize(10);
        doc.text(`Course: ${lectureCourse} | Professor: ${lectureProfessor}`, 20, y);
        y += 15;

        // Summary
        doc.setFontSize(14);
        doc.text("Summary", 20, y);
        y += 8;
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(summary.executiveSummary, 170);
        doc.text(summaryLines, 20, y);
        y += summaryLines.length * 5 + 10;

        // Key Topics
        doc.setFontSize(14);
        doc.text("Key Topics", 20, y);
        y += 8;
        doc.setFontSize(10);
        summary.keyTopics.forEach(({ topic }) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(`• ${topic}`, 20, y);
            y += 6;
        });
        y += 10;

        // Definitions
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(14);
        doc.text("Definitions", 20, y);
        y += 8;
        doc.setFontSize(10);
        summary.definitions.forEach(({ term, definition }) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.text(`${term}:`, 20, y);
            y += 5;
            const defLines = doc.splitTextToSize(definition, 170);
            doc.text(defLines, 20, y);
            y += defLines.length * 5 + 5;
        });

        doc.save(`${lectureTitle.replace(/[^a-z0-9]/gi, "_")}.pdf`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyMarkdown}>
                    {copied ? (
                        <Check className="mr-2 h-4 w-4" />
                    ) : (
                        <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy as Markdown"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
