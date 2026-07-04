package com.richardjiang880.lernchih.exception;

/**
 * Thrown when an anonymous user requests a file download that exceeds the
 * configured large-download threshold. The global handler maps this to an
 * RFC 7807 ProblemDetail response with HTTP 401 Unauthorized.
 */
public class LargeAnonymousDownloadException extends RuntimeException {

    public LargeAnonymousDownloadException() {
        super("Large file downloads require login");
    }
}
