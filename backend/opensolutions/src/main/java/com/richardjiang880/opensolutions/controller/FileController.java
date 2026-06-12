package com.richardjiang880.opensolutions.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Try to figure out a reasonable content type
            String contentType = "application/octet-stream";
            String lowerName = filename.toLowerCase();
            if (lowerName.endsWith(".pdf")) {
                contentType = MediaType.APPLICATION_PDF_VALUE;
            } else if (lowerName.endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG_VALUE;
            } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
                contentType = MediaType.IMAGE_JPEG_VALUE;
            } else if (lowerName.endsWith(".gif")) {
                contentType = MediaType.IMAGE_GIF_VALUE;
            } else if (lowerName.endsWith(".mp4")) {
                contentType = "video/mp4";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
