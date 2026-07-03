package com.richardjiang880.lernchih.controller;

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

class FileControllerTest {

    private FileController controller;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        controller = new FileController();
        ReflectionTestUtils.setField(controller, "uploadDir", tempDir.toString());
    }

    @Test
    void serveFileRejectsPathTraversal() {
        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("../secret.txt");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void serveFileReturnsNotFoundForMissingFile() {
        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("missing.pdf");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void serveFileReturnsPdfContentType() throws Exception {
        Files.write(tempDir.resolve("doc.pdf"), new byte[]{1, 2, 3});

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("doc.pdf");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
    }

    @Test
    void serveFileReturnsPngContentType() throws Exception {
        Files.write(tempDir.resolve("image.png"), new byte[]{1, 2, 3});

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("image.png");

        assertThat(result.getHeaders().getContentType()).isEqualTo(MediaType.IMAGE_PNG);
    }

    @Test
    void serveFileReturnsOctetStreamForUnknownExtension() throws Exception {
        Files.write(tempDir.resolve("data.bin"), new byte[]{1, 2, 3});

        ResponseEntity<org.springframework.core.io.Resource> result = controller.serveFile("data.bin");

        assertThat(result.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
    }
}
