package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.exception.FileUploadSizeExceededException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileValidatorTest {

    private final FileValidator validator = new FileValidator(1024);

    @Test
    void validateAcceptsValidPng() {
        byte[] content = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MultipartFile file = new MockMultipartFile("file", "image.png", "image/png", content);

        assertThat(validator.validate(file)).isEqualTo("png");
    }

    @Test
    void validateAcceptsValidJpeg() {
        byte[] content = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00};
        MultipartFile file = new MockMultipartFile("file", "image.jpg", "image/jpeg", content);

        assertThat(validator.validate(file)).isEqualTo("jpg");
    }

    @Test
    void validateAcceptsTextMarkdownWithoutMagicBytes() {
        MultipartFile file = new MockMultipartFile("file", "notes.md", "text/markdown", "# Hello".getBytes());

        assertThat(validator.validate(file)).isEqualTo("md");
    }

    @Test
    void validateThrowsWhenFileIsEmpty() {
        MultipartFile file = new MockMultipartFile("file", "image.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void validateThrowsWhenFileNameIsMissing() {
        MultipartFile file = new MockMultipartFile("file", "", "image/png", new byte[]{1});

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name");
    }

    @Test
    void validateThrowsWhenFileNameContainsPathTraversal() {
        MultipartFile file = new MockMultipartFile("file", "../image.png", "image/png", new byte[]{1});

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid file name");
    }

    @Test
    void validateThrowsWhenExtensionIsNotAllowed() {
        MultipartFile file = new MockMultipartFile("file", "malware.exe", "application/octet-stream", new byte[]{1});

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File type not allowed");
    }

    @Test
    void validateThrowsWhenContentTypeDoesNotMatchExtension() {
        byte[] content = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47};
        MultipartFile file = new MockMultipartFile("file", "image.png", "image/jpeg", content);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("content type");
    }

    @Test
    void validateThrowsWhenMagicBytesDoNotMatchDeclaredType() {
        byte[] content = new byte[]{0x00, 0x00, 0x00, 0x00};
        MultipartFile file = new MockMultipartFile("file", "image.png", "image/png", content);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not match");
    }

    @Test
    void validateLowercasesExtension() {
        byte[] content = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MultipartFile file = new MockMultipartFile("file", "IMAGE.PNG", "image/png", content);

        assertThat(validator.validate(file)).isEqualTo("png");
    }

    @Test
    void validateThrowsWhenFileExceedsMaxUploadSize() {
        byte[] content = new byte[1025];
        MultipartFile file = new MockMultipartFile("file", "big.png", "image/png", content);

        assertThatThrownBy(() -> validator.validate(file))
                .isInstanceOf(FileUploadSizeExceededException.class)
                .hasMessageContaining("maximum upload size");
    }
}
