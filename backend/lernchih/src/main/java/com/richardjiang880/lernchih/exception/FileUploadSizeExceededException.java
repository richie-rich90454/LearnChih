package com.richardjiang880.lernchih.exception;

/**
 * Thrown when an uploaded file exceeds the configured maximum upload size.
 * The global handler maps this to an RFC 7807 ProblemDetail response with
 * HTTP 413 Payload Too Large.
 */
public class FileUploadSizeExceededException extends RuntimeException {

    public FileUploadSizeExceededException(String message) {
        super(message);
    }
}
