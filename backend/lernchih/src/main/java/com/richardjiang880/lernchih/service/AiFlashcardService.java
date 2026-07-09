package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.AiFlashcardDtos.GeneratedFlashcard;
import com.richardjiang880.lernchih.dto.AiFlashcardDtos.GenerateResponse;
import com.richardjiang880.lernchih.dto.AiFlashcardDtos.SaveRequest;
import com.richardjiang880.lernchih.dto.AiFlashcardDtos.SaveResponse;
import com.richardjiang880.lernchih.model.Flashcard;
import com.richardjiang880.lernchih.model.FlashcardDeck;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.FlashcardDeckRepository;
import com.richardjiang880.lernchih.repository.FlashcardRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Mock AI flashcard generator (F4). Rather than calling an external LLM, this
 * service derives cloze-deletion flashcards deterministically from a
 * resource's title and description: each sufficiently long sentence yields a
 * card whose front masks the longest content word and whose back is that word.
 * Generated cards can then be persisted into a new deck via {@link #save}.
 */
@Service
public class AiFlashcardService {

    private static final int MAX_CARDS = 6;

    private final ResourceRepository resourceRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final FlashcardRepository flashcardRepository;

    public AiFlashcardService(ResourceRepository resourceRepository,
                              FlashcardDeckRepository flashcardDeckRepository,
                              FlashcardRepository flashcardRepository) {
        this.resourceRepository = resourceRepository;
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.flashcardRepository = flashcardRepository;
    }

    @Transactional(readOnly = true)
    public GenerateResponse generate(Long userId, Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId).orElse(null);
        return new GenerateResponse(buildCards(resource));
    }

    @Transactional
    public SaveResponse save(Long userId, Long resourceId, SaveRequest request) {
        if (request == null || request.cards() == null || request.cards().isEmpty()) {
            throw new IllegalArgumentException("No flashcards to save");
        }
        String name = (request.deckName() == null || request.deckName().isBlank())
                ? "AI Flashcards"
                : request.deckName().trim();

        FlashcardDeck deck = FlashcardDeck.builder()
                .userId(userId)
                .name(name)
                .build();
        deck = flashcardDeckRepository.save(deck);

        List<Flashcard> flashcards = new ArrayList<>();
        for (GeneratedFlashcard card : request.cards()) {
            if (card == null || card.front() == null || card.back() == null) {
                continue;
            }
            flashcards.add(Flashcard.builder()
                    .deckId(deck.getId())
                    .front(card.front())
                    .back(card.back())
                    .build());
        }
        flashcardRepository.saveAll(flashcards);
        return new SaveResponse(deck.getId(), flashcards.size());
    }

    /**
     * Deterministic cloze-deletion card builder. Splits the resource's title +
     * description into sentences, then for each sentence with at least four
     * words masks the longest content word (>= 4 chars) to form a flashcard.
     */
    private List<GeneratedFlashcard> buildCards(Resource resource) {
        List<GeneratedFlashcard> cards = new ArrayList<>();
        if (resource == null) {
            return cards;
        }
        String title = resource.getTitle();
        String description = resource.getDescription();

        StringBuilder corpus = new StringBuilder();
        if (title != null && !title.isBlank()) {
            corpus.append(title.trim()).append(". ");
        }
        if (description != null && !description.isBlank()) {
            corpus.append(description.trim());
        }
        if (corpus.length() == 0) {
            return cards;
        }

        String[] sentences = corpus.toString().split("(?<=[.!?])\\s+");
        for (String raw : sentences) {
            if (cards.size() >= MAX_CARDS) {
                break;
            }
            String sentence = raw.trim();
            if (sentence.isEmpty()) {
                continue;
            }
            String[] words = sentence.split("\\s+");
            if (words.length < 4) {
                continue;
            }
            int targetIdx = pickLongestWord(words);
            if (targetIdx < 0) {
                continue;
            }
            String answer = stripPunct(words[targetIdx]);
            if (answer.length() < 4) {
                continue;
            }
            StringBuilder cloze = new StringBuilder();
            for (int i = 0; i < words.length; i++) {
                if (i > 0) {
                    cloze.append(" ");
                }
                cloze.append(i == targetIdx ? "_____" : words[i]);
            }
            cards.add(new GeneratedFlashcard(cloze.toString(), answer));
        }
        return cards;
    }

    private int pickLongestWord(String[] words) {
        int best = -1;
        int bestLen = 0;
        for (int i = 0; i < words.length; i++) {
            int len = stripPunct(words[i]).length();
            if (len > bestLen && len >= 4) {
                bestLen = len;
                best = i;
            }
        }
        return best;
    }

    private String stripPunct(String word) {
        if (word == null) {
            return "";
        }
        return word.replaceAll("[^\\p{L}\\p{N}]", "");
    }
}
