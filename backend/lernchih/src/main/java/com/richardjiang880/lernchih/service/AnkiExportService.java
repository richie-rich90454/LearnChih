package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.Flashcard;
import com.richardjiang880.lernchih.model.FlashcardDeck;
import com.richardjiang880.lernchih.repository.FlashcardDeckRepository;
import com.richardjiang880.lernchih.repository.FlashcardRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Exports a {@link FlashcardDeck} to an Anki .apkg file (F25).
 *
 * <p>An .apkg is a ZIP archive containing a {@code media} JSON file (here
 * empty: {@code "{}"}) and a SQLite database ({@code collection.anki2})
 * with the Anki collection schema: {@code col}, {@code notes}, {@code cards},
 * {@code revlog}, and {@code graves} tables. Each flashcard becomes a note
 * with {@code Front} and {@code Back} fields and a single card linked to a
 * deck named after the source FlashcardDeck.
 */
@Service
public class AnkiExportService {

    private static final long MODEL_ID = 1L;
    private static final long DECK_ID = 1L;
    private static final String FIELD_SEPARATOR = "\u001f";

    private final FlashcardDeckRepository flashcardDeckRepository;
    private final FlashcardRepository flashcardRepository;

    public AnkiExportService(FlashcardDeckRepository flashcardDeckRepository,
                             FlashcardRepository flashcardRepository) {
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.flashcardRepository = flashcardRepository;
    }

    /**
     * Generate an .apkg byte array for the given deck.
     *
     * @param deckId the flashcard deck ID
     * @return ZIP bytes suitable for writing as application/octet-stream
     */
    public byte[] exportApkg(Long deckId) throws IOException {
        FlashcardDeck deck = flashcardDeckRepository.findById(deckId)
                .orElseThrow(() -> new IllegalArgumentException("Deck not found: " + deckId));
        List<Flashcard> cards = flashcardRepository.findByDeckId(deckId);
        if (cards.isEmpty()) {
            throw new IllegalStateException("Deck has no flashcards to export");
        }

        Path dbFile = Files.createTempFile("lernchih-anki-", ".anki2");
        try {
            createAnkiDatabase(dbFile, deck.getName(), cards);
            byte[] dbBytes = Files.readAllBytes(dbFile);
            return zipApkg(dbBytes);
        } finally {
            Files.deleteIfExists(dbFile);
        }
    }

    private void createAnkiDatabase(Path dbFile, String deckName, List<Flashcard> cards) throws IOException {
        String url = "jdbc:sqlite:" + dbFile.toString();
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement()) {

            stmt.execute("PRAGMA foreign_keys = OFF");

            stmt.execute("CREATE TABLE col ("
                    + "id INTEGER PRIMARY KEY, crt INTEGER NOT NULL, mod INTEGER NOT NULL, "
                    + "scm INTEGER NOT NULL, usn INTEGER NOT NULL, ls INTEGER NOT NULL, "
                    + "conf TEXT NOT NULL, models TEXT NOT NULL, decks TEXT NOT NULL, "
                    + "dconf TEXT NOT NULL, tags TEXT NOT NULL)");

            stmt.execute("CREATE TABLE notes ("
                    + "id INTEGER PRIMARY KEY, guid TEXT NOT NULL, mid INTEGER NOT NULL, "
                    + "mod INTEGER NOT NULL, usn INTEGER NOT NULL, tags TEXT NOT NULL, "
                    + "flds TEXT NOT NULL, sfld TEXT NOT NULL, csum INTEGER NOT NULL, "
                    + "flags INTEGER NOT NULL, data TEXT NOT NULL)");

            stmt.execute("CREATE TABLE cards ("
                    + "id INTEGER PRIMARY KEY, nid INTEGER NOT NULL, did INTEGER NOT NULL, "
                    + "ord INTEGER NOT NULL, mod INTEGER NOT NULL, usn INTEGER NOT NULL, "
                    + "type INTEGER NOT NULL, queue INTEGER NOT NULL, due INTEGER NOT NULL, "
                    + "ivl INTEGER NOT NULL, factor INTEGER NOT NULL, reps INTEGER NOT NULL, "
                    + "lapses INTEGER NOT NULL, left INTEGER NOT NULL, odue INTEGER NOT NULL, "
                    + "odid INTEGER NOT NULL, flags INTEGER NOT NULL, data TEXT NOT NULL)");

            stmt.execute("CREATE TABLE revlog ("
                    + "id INTEGER PRIMARY KEY, cid INTEGER NOT NULL, usn INTEGER NOT NULL, "
                    + "ease INTEGER NOT NULL, ivl INTEGER NOT NULL, lastIvl INTEGER NOT NULL, "
                    + "factor INTEGER NOT NULL, time INTEGER NOT NULL, type INTEGER NOT NULL)");

            stmt.execute("CREATE TABLE graves (usn INTEGER NOT NULL, oid INTEGER NOT NULL, type INTEGER NOT NULL)");

            stmt.execute("CREATE INDEX ix_notes_usn ON notes (usn)");
            stmt.execute("CREATE INDEX ix_notes_csum ON notes (csum)");
            stmt.execute("CREATE INDEX ix_cards_usn ON cards (usn)");
            stmt.execute("CREATE INDEX ix_cards_nid ON cards (nid)");
            stmt.execute("CREATE INDEX ix_revlog_cid ON revlog (cid)");
            stmt.execute("CREATE INDEX ix_revlog_usn ON revlog (usn)");

            long now = System.currentTimeMillis() / 1000;
            String modelsJson = buildModelsJson();
            String decksJson = buildDecksJson(deckName);
            String dconfJson = buildDconfJson();
            String confJson = "{\"activeDecks\":[1],\"curDeck\":1,\"curStudy\":[],\"newBury\":false,\"dayLearnFirst\":false,\"estTimes\":true,\"dueCounts\":true}";

            stmt.execute(String.format(
                    "INSERT INTO col (id, crt, mod, scm, usn, ls, conf, models, decks, dconf, tags) "
                            + "VALUES (1, %d, %d, %d, -1, 0, '%s', '%s', '%s', '%s', '[]')",
                    now, now, now, confJson, modelsJson, decksJson, dconfJson));

            long baseNoteId = now * 1000;
            String insertNoteSql = "INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) "
                    + "VALUES (?, ?, ?, ?, -1, '', ?, ?, ?, 0, '')";
            String insertCardSql = "INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) "
                    + "VALUES (?, ?, ?, 0, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, '')";

            try (PreparedStatement noteStmt = conn.prepareStatement(insertNoteSql);
                 PreparedStatement cardStmt = conn.prepareStatement(insertCardSql)) {

                int idx = 0;
                for (Flashcard card : cards) {
                    long noteId = baseNoteId + idx;
                    String front = sanitize(card.getFront());
                    String back = sanitize(card.getBack());
                    String flds = front + FIELD_SEPARATOR + back;
                    long csum = checksum(front);

                    noteStmt.setLong(1, noteId);
                    noteStmt.setString(2, guid(noteId));
                    noteStmt.setLong(3, MODEL_ID);
                    noteStmt.setLong(4, now);
                    noteStmt.setString(5, flds);
                    noteStmt.setString(6, front);
                    noteStmt.setLong(7, csum);
                    noteStmt.executeUpdate();

                    long cardId = noteId + 1;
                    cardStmt.setLong(1, cardId);
                    cardStmt.setLong(2, noteId);
                    cardStmt.setLong(3, DECK_ID);
                    cardStmt.setLong(4, now);
                    cardStmt.setInt(5, idx);
                    cardStmt.executeUpdate();

                    idx++;
                }
            }
        } catch (Exception e) {
            throw new IOException("Failed to create Anki database", e);
        }
    }

    private byte[] zipApkg(byte[] dbBytes) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry mediaEntry = new ZipEntry("media");
            zos.putNextEntry(mediaEntry);
            zos.write("{}".getBytes(java.nio.charset.StandardCharsets.UTF_8));
            zos.closeEntry();

            ZipEntry dbEntry = new ZipEntry("collection.anki2");
            zos.putNextEntry(dbEntry);
            zos.write(dbBytes);
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

    private String buildModelsJson() {
        return "{\"1\":{\"id\":1,\"name\":\"Basic\",\"type\":0,\"mod\":0,\"usn\":-1,"
                + "\"sortf\":0,\"did\":1,\"tmpls\":[{\"id\":1,\"name\":\"Card 1\",\"ord\":0,"
                + "\"qfmt\":\"{{Front}}\",\"afmt\":\"{{FrontSide}}<hr id=answer>{{Back}}\","
                + "\"bqfmt\":\"\",\"bafmt\":\"\",\"did\":null,\"bfont\":\"\",\"bsize\":0}],"
                + "\"flds\":[{\"name\":\"Front\",\"ord\":0,\"sticky\":false,\"rtl\":false,"
                + "\"font\":\"Arial\",\"size\":20},{\"name\":\"Back\",\"ord\":1,\"sticky\":false,"
                + "\"rtl\":false,\"font\":\"Arial\",\"size\":20}],"
                + "\"css\":\".card{font-family:arial;font-size:20px;text-align:center;color:black;background-color:white;}\","
                + "\"latexPre\":\"\\\\documentclass[12pt]{article}\\n\\\\special{papersize,3in,5in}\\n"
                + "\\\\usepackage[utf8]{inputenc}\\n\\\\usepackage{amssymb,amsmath}\\n\\\\pagestyle{empty}\\n"
                + "\\\\setlength{\\\\parindent}{0in}\\n\\\\begin{document}\\n\","
                + "\"latexPost\":\"\\\\end{document}\",\"req\":[[0,\"any\",[0,1]]],\"originalId\":null}}";
    }

    private String buildDecksJson(String deckName) {
        String safeName = deckName.replace("'", "\\'");
        return "{\"1\":{\"id\":1,\"name\":\"" + safeName + "\",\"mod\":0,\"usn\":-1,"
                + "\"desc\":\"\",\"dyn\":0,\"collapsed\":false,\"browserCollapsed\":false,"
                + "\"extendNew\":10,\"extendRev\":50,\"conf\":1,\"reviewCardOrderType\":0,"
                + "\"newCardOrderType\":0,\"browserSideDisabled\":[false,false],\"sideOneDisabled\":false}}";
    }

    private String buildDconfJson() {
        return "{\"1\":{\"id\":1,\"name\":\"Default\",\"mod\":0,\"usn\":-1,\"autoplay\":true,"
                + "\"dyn\":false,\"lapse\":{\"delays\":[10],\"mult\":0.5,\"minInt\":1,\"leechFails\":8,"
                + "\"leechAction\":1},\"new\":{\"bury\":false,\"delays\":[1,10],\"ints\":[1,4,7],"
                + "\"initialFactor\":2500,\"perDay\":20,\"order\":1},\"rev\":{\"bury\":false,"
                + "\"ease4\":1.3,\"fuzz\":0.05,\"ivlFct\":1,\"maxIvl\":36500,\"minSpace\":1,\"perDay\":200,"
                + "\"hardFactor\":1.2,\"minSpaceReview\":1},\"timer\":0,\"replayq\":true,\"maxTaken\":60}}";
    }

    private String sanitize(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("\"", "&quot;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>");
    }

    private long checksum(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        long hash = 0;
        for (int i = 0; i < text.length(); i++) {
            hash = (hash * 31 + text.charAt(i)) & 0xFFFFFFFFL;
        }
        return hash;
    }

    private String guid(long id) {
        return String.format("%08x", id % 0xFFFFFFFFL);
    }
}
