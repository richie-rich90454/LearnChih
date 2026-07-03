package com.richardjiang880.lernchih.support;

import org.junit.jupiter.api.extension.ExtendWith;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Disables the annotated test or test class when Docker is not available.
 *
 * <p>Intended for Testcontainers-based integration tests that require a running
 * Docker daemon. When Docker is missing the tests are skipped rather than failing.
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@ExtendWith(DockerAvailableCondition.class)
public @interface EnabledIfDockerAvailable {
}
