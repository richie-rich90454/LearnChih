package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.ApiKey;
import com.richardjiang880.lernchih.repository.ApiKeyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {

    @Mock
    private ApiKeyRepository apiKeyRepository;

    @InjectMocks
    private ApiKeyService apiKeyService;

    @Test
    void generateApiKeyReturnsRawKeyAndSavesHash() {
        when(apiKeyRepository.save(any(ApiKey.class))).thenAnswer(inv -> {
            ApiKey k = inv.getArgument(0);
            k.setId(1L);
            return k;
        });

        String rawKey = apiKeyService.generateApiKey(1L, "My Key");

        assertThat(rawKey).startsWith("lk_");
        ArgumentCaptor<ApiKey> captor = ArgumentCaptor.forClass(ApiKey.class);
        verify(apiKeyRepository).save(captor.capture());
        assertThat(captor.getValue().getKeyHash()).isNotBlank();
        assertThat(captor.getValue().getName()).isEqualTo("My Key");
    }

    @Test
    void verifyApiKeyReturnsUserIdForValidUnrevokedKey() {
        ApiKey key = ApiKey.builder().userId(1L).revoked(false).build();
        when(apiKeyRepository.findByKeyHash(anyString())).thenReturn(Optional.of(key));

        Optional<Long> userId = apiKeyService.verifyApiKey("valid-key");

        assertThat(userId).hasValue(1L);
    }

    @Test
    void verifyApiKeyReturnsEmptyForRevokedKey() {
        ApiKey key = ApiKey.builder().userId(1L).revoked(true).build();
        when(apiKeyRepository.findByKeyHash(anyString())).thenReturn(Optional.of(key));

        assertThat(apiKeyService.verifyApiKey("revoked-key")).isEmpty();
    }

    @Test
    void verifyApiKeyReturnsEmptyForBlankKey() {
        assertThat(apiKeyService.verifyApiKey("   ")).isEmpty();
        assertThat(apiKeyService.verifyApiKey(null)).isEmpty();
    }

    @Test
    void recordUsageUpdatesLastUsedAt() {
        ApiKey key = ApiKey.builder().revoked(false).build();
        when(apiKeyRepository.findByKeyHash(anyString())).thenReturn(Optional.of(key));
        when(apiKeyRepository.save(any(ApiKey.class))).thenAnswer(inv -> inv.getArgument(0));

        apiKeyService.recordUsage("valid-key");

        assertThat(key.getLastUsedAt()).isNotNull();
    }

    @Test
    void revokeApiKeyRevokesOwnedKey() {
        ApiKey key = ApiKey.builder().id(1L).userId(1L).revoked(false).build();
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(key));
        when(apiKeyRepository.save(any(ApiKey.class))).thenAnswer(inv -> inv.getArgument(0));

        apiKeyService.revokeApiKey(1L, 1L);

        assertThat(key.getRevoked()).isTrue();
    }

    @Test
    void revokeApiKeyThrowsForForeignKey() {
        ApiKey key = ApiKey.builder().id(1L).userId(1L).build();
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(key));

        assertThatThrownBy(() -> apiKeyService.revokeApiKey(1L, 2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("only revoke your own");
    }

    @Test
    void listApiKeysReturnsUnrevokedKeys() {
        ApiKey key = ApiKey.builder().userId(1L).revoked(false).build();
        when(apiKeyRepository.findByUserIdAndRevokedFalse(1L)).thenReturn(List.of(key));

        assertThat(apiKeyService.listApiKeys(1L)).containsExactly(key);
    }
}
