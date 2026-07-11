package com.richardjiang880.lernchih.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.richardjiang880.lernchih.model.Note;
import com.richardjiang880.lernchih.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Exports a {@link Note} to Markdown or PDF format (F26).
 *
 * <p>The Markdown export wraps the note title as a level-1 heading followed
 * by the raw content. The PDF export renders a simple HTML representation of
 * the note via openhtmltopdf, producing a paginated A4 document.
 */
@Service
public class NoteExportService {

    private final NoteRepository noteRepository;

    public NoteExportService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    /**
     * Generate a Markdown representation of the note.
     *
     * @param noteId the note ID
     * @return Markdown text (UTF-8 string)
     */
    public String exportMarkdown(Long noteId) {
        Note note = getNote(noteId);
        StringBuilder md = new StringBuilder();
        md.append("# ").append(note.getTitle()).append("\n\n");
        if (note.getContent() != null && !note.getContent().isBlank()) {
            md.append(note.getContent());
        }
        return md.toString();
    }

    /**
     * Generate a PDF representation of the note.
     *
     * @param noteId the note ID
     * @return PDF bytes
     */
    public byte[] exportPdf(Long noteId) throws IOException {
        Note note = getNote(noteId);
        String html = buildHtml(note);
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        }
    }

    private Note getNote(Long noteId) {
        return noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found: " + noteId));
    }

    private String buildHtml(Note note) {
        String title = escapeHtml(note.getTitle());
        String content = note.getContent() == null ? "" : contentToHtml(note.getContent());
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">"
                + "<style>"
                + "body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"
                + "font-size:14px;line-height:1.6;color:#222;margin:48px;}"
                + "h1{font-size:24px;margin-bottom:16px;border-bottom:1px solid #ddd;padding-bottom:8px;}"
                + "p{margin:0 0 12px;}"
                + ".wikilink{color:#0066cc;text-decoration:underline;}"
                + "</style></head><body>"
                + "<h1>" + title + "</h1>"
                + "<div>" + content + "</div>"
                + "</body></html>";
    }

    private String contentToHtml(String content) {
        String escaped = escapeHtml(content);
        String[] lines = escaped.split("\n");
        StringBuilder html = new StringBuilder();
        for (String line : lines) {
            if (line.isBlank()) {
                html.append("<p><br></p>");
            } else {
                String converted = convertWikilinks(line);
                html.append("<p>").append(converted).append("</p>");
            }
        }
        return html.toString();
    }

    private String convertWikilinks(String line) {
        return line.replaceAll("\\[\\[([^]]+)\\]\\]",
                "<span class=\"wikilink\">$1</span>");
    }

    private String escapeHtml(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
