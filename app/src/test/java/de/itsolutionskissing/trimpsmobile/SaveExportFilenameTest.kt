package de.itsolutionskissing.trimpsmobile

import java.time.LocalDateTime
import org.junit.Assert.assertEquals
import org.junit.Test

class SaveExportFilenameTest {
    @Test fun exportUsesLocalDateAndMinuteWithoutSeconds() {
        assertEquals("scruffy-colony-save-2026-10-17_08-05.txt", saveExportFilename(LocalDateTime.of(2026, 10, 17, 8, 5, 59)))
        assertEquals("scruffy-colony-save-2027-01-02_00-00.txt", saveExportFilename(LocalDateTime.of(2027, 1, 2, 0, 0, 1)))
    }
}
