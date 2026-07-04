package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.exception.LargeAnonymousDownloadException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileControllerTest {

    private FileController controller;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        controller = new FileController();
        ReflectionTestUtils.setField(controller, "uploadDir", tempDir.toString());
        ReflectionTestUtils.setField(controller, "largeDownloadThreshold", 10L);
    }

    @Test
    void serveFileRejectsPathTraversal() {
        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("../secret.txt", null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void serveFileReturnsNotFoundForMissingFile() {
        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("missing.pdf", null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void serveFileReturnsPdfContentType() throws Exception {
        Files.write(tempDir.resolve("doc.pdf"), new byte[]{1, 2, 3});

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("doc.pdf", null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
    }

    @Test
    void serveFileReturnsPngContentType() throws Exception {
        Files.write(tempDir.resolve("image.png"), new byte[]{1, 2, 3});

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("image.png", null);

        assertThat(result.getHeaders().getContentType()).isEqualTo(MediaType.IMAGE_PNG);
    }

    @Test
    void serveFileReturnsOctetStreamForUnknownExtension() throws Exception {
        Files.write(tempDir.resolve("data.bin"), new byte[]{1, 2, 3});

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("data.bin", null);

        assertThat(result.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
    }

    @Test
    void serveFileRejectsLargeAnonymousDownloads() throws Exception {
        Files.write(tempDir.resolve("large.bin"), new byte[11]);

        assertThatThrownBy(() -> controller.serveFile("large.bin", null))
                .isInstanceOf(LargeAnonymousDownloadException.class);
    }

    @Test
    void serveFileAllowsLargeDownloadsForAuthenticatedUsers() throws Exception {
        Files.write(tempDir.resolve("large.bin"), new byte[11]);

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("large.bin", "Bearer token");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void serveFileAllowsSmallAnonymousDownloads() throws Exception {
        Files.write(tempDir.resolve("small.bin"), new byte[5]);

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("small.bin", null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
