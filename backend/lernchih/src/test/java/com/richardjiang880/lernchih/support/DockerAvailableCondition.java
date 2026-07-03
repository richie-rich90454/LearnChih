package com.richardjiang880.lernchih.support;

import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.testcontainers.DockerClientFactory;

/**
 * JUnit 5 execution condition that disables tests when Docker is unavailable.
 *
 * <p>Useful in CI environments or sandboxes where Testcontainers cannot start
 * containers. Tests annotated with {@link EnabledIfDockerAvailable} are skipped
 * gracefully instead of failing with an {@link IllegalStateException}.
 */
public class DockerAvailableCondition implements ExecutionCondition {

    @Override
    public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext context) {
        try {
            DockerClientFactory.instance().client();
            return ConditionEvaluationResult.enabled("Docker is available");
        } catch (Throwable t) {
            return ConditionEvaluationResult.disabled("Docker is not available: " + t.getMessage());
        }
    }
}
