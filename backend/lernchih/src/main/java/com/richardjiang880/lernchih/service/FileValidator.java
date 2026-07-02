package com.richardjiang880.lernchih.service;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Hardens file uploads by enforcing an extension allowlist, a matching
 * declared-MIME allowlist, and magic-byte verification of the file content.
 *
 * <p>{@link #validate(MultipartFile)} throws {@link IllegalArgumentException}
 * (mapped to HTTP 400 by the global exception handler) on any violation and
 * returns the validated, lowercased extension (without the dot) on success so
 * callers can build a safe UUID-based filename.
 */
@Component
public class FileValidator {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "png", "jpg", "jpeg", "gif", "webp", "svg", "pdf", "txt", "md", "docx", "pptx", "xlsx"
    );

    // Declared MIME types that are acceptable for each extension (lowercased).
    private static final Map<String, Set<String>> EXTENSION_MIMES = Map.ofEntries(
            Map.entry("png", Set.of("image/png")),
            Map.entry("jpg", Set.of("image/jpeg")),
            Map.entry("jpeg", Set.of("image/jpeg")),
            Map.entry("gif", Set.of("image/gif")),
            Map.entry("webp", Set.of("image/webp")),
            Map.entry("svg", Set.of("image/svg+xml", "image/svg")),
            Map.entry("pdf", Set.of("application/pdf")),
            Map.entry("txt", Set.of("text/plain")),
            Map.entry("md", Set.of("text/markdown", "text/plain", "text/x-markdown")),
            Map.entry("docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            Map.entry("pptx", Set.of("application/vnd.openxmlformats-officedocument.presentationml.presentation")),
            Map.entry("xlsx", Set.of("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
    );

    // Text-based extensions for which magic-byte verification is skipped.
    private static final Set<String> TEXT_EXTENSIONS = Set.of("svg", "txt", "md");

    private static final int MAGIC_BYTE_READ_LENGTH = 12;

    /**
     * Validate an uploaded file. Throws {@link IllegalArgumentException} on any
     * violation.
     *
     * @return the validated, lowercased extension (without the leading dot).
     */
    public String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("File name is missing");
        }

        // Reject path traversal / path separators in the client-provided name.
        if (originalFilename.contains("..") || originalFilename.contains("/")
                || originalFilename.contains("\\")) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("File type not allowed: " + extension);
        }

        String contentType = file.getContentType();
        Set<String> allowedMimes = EXTENSION_MIMES.get(extension);
        if (contentType == null || !allowedMimes.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("File content type not allowed: " + contentType);
        }

        verifyMagicBytes(file, extension);
        return extension;
    }

    private String extractExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            throw new IllegalArgumentException("File has no extension");
        }
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private void verifyMagicBytes(MultipartFile file, String extension) {
        if (TEXT_EXTENSIONS.contains(extension)) {
            // svg/txt/md are text-based; rely on extension + declared MIME + size.
            return;
        }
        try (InputStream is = file.getInputStream()) {
            byte[] header = is.readNBytes(MAGIC_BYTE_READ_LENGTH);
            if (!matchesMagicBytes(extension, header)) {
                throw new IllegalArgumentException("File content does not match its declared type");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read file content for validation", e);
        }
    }

    private boolean matchesMagicBytes(String extension, byte[] header) {
        return switch (extension) {
            case "png"  -> startsWith(header, 0x89, 0x50, 0x4E, 0x47);            // \x89PNG
            case "jpg", "jpeg" -> startsWith(header, 0xFF, 0xD8, 0xFF);            // JPEG SOI
            case "gif"  -> startsWith(header, 0x47, 0x49, 0x46, 0x38);            // GIF8
            case "pdf"  -> startsWith(header, 0x25, 0x50, 0x44, 0x46);            // %PDF
            case "webp" -> isWebp(header);                                        // RIFF....WEBP
            case "docx", "pptx", "xlsx" -> startsWith(header, 0x50, 0x4B, 0x03, 0x04); // PK\x03\x04 (ZIP)
            default -> false;
        };
    }

    private boolean startsWith(byte[] header, int... expected) {
        if (header.length < expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if ((header[i] & 0xFF) != expected[i]) {
                return false;
            }
        }
        return true;
    }

    private boolean isWebp(byte[] header) {
        // Bytes 0-3: "RIFF", bytes 8-11: "WEBP"
        return header.length >= 12
                && startsWith(header, 0x52, 0x49, 0x46, 0x46)
                && (header[8] & 0xFF) == 0x57
                && (header[9] & 0xFF) == 0x45
                && (header[10] & 0xFF) == 0x42
                && (header[11] & 0xFF) == 0x50;
    }
}
