package de.itsolutionskissing.trimpsmobile

import androidx.core.util.AtomicFile
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

/** JVM test: runs in CI with testDebugUnitTest. */
class SlotStoreTest {
    @get:Rule val temporary = TemporaryFolder()
    private fun directory(): File = temporary.newFolder()
    private fun open(root: File) = SlotStore(root, true).apply { refreshSelection() }
    @Test fun constructingReplacementStoreCannotReadOrInterruptAnInFlightAtomicSelection() {
        val root = directory()
        SlotStore(root, true).select("1")
        val file = AtomicFile(File(root, "active-slot.json"))
        val stream = file.startWrite()
        stream.write("{\"schema\":1,\"active\":\"2\"}".toByteArray())
        val replacement = SlotStore(root, true)
        assertNull(replacement.current)
        file.finishWrite(stream)
        replacement.refreshSelection()
        assertEquals("2", replacement.current)
    }

    @Test fun legacyCheckpointStaysInPlaceAndThreeSlotsRemainIndependentAfterReopen() {
        val root = directory()
        val old = CheckpointStore.forDirectory(root)
        old.checkpoint("legacy")
        val before = File(root, "checkpoint.json").readBytes()
        val slots = open(root)
        assertEquals("1", slots.current)
        assertEquals("legacy", slots.store("1").read().lastGood)
        assertArrayEquals(before, File(root, "checkpoint.json").readBytes())
        slots.select("2")
        slots.store("2").checkpoint("second")
        slots.select("3")
        slots.store("3").checkpoint("third")
        val stale = open(root)
        slots.select("2")
        stale.refreshSelection()
        assertEquals("2", stale.current)
        slots.select("3")
        val reopened = open(root)
        assertEquals("3", reopened.current)
        assertEquals("legacy", reopened.store("1").read().lastGood)
        assertEquals("second", reopened.store("2").read().lastGood)
        assertEquals("third", reopened.store("3").read().lastGood)
        assertArrayEquals(before, File(root, "checkpoint.json").readBytes())
    }

    @Test fun developmentNeverBecomesThePersistedNormalSlotAndCannotUsePersonalStorage() {
        val root = directory()
        val slots = open(root)
        slots.store("1").checkpoint("personal")
        slots.select("2")
        slots.store("2").checkpoint("other")
        slots.startDevelopment("synthetic")
        assertEquals("dev", slots.current)
        slots.store("dev").checkpoint("synthetic-autosave")
        assertEquals("personal", slots.store("1").read().lastGood)
        assertEquals("other", slots.store("2").read().lastGood)
        assertEquals("2", open(root).current)
        assertEquals("synthetic-autosave", slots.store("dev").read().lastGood)
        assertThrows(IllegalArgumentException::class.java) { SlotStore(root, false).startDevelopment("forbidden") }
        assertThrows(IllegalArgumentException::class.java) { slots.store("../../checkpoint") }
        assertThrows(IllegalArgumentException::class.java) { slots.select("dev") }
        assertEquals("other", slots.store("2").read().lastGood)
    }

    // V-248: deleting removes only the chosen save (also its backup copy and a pending import) and keeps the selection.
    @Test fun deletingOneSaveEmptiesOnlyThatSlotAndKeepsTheSelection() {
        val root = directory()
        val slots = open(root)
        slots.store("1").checkpoint("first")
        slots.store("2").checkpoint("second")
        slots.store("2").beginImport("second")
        slots.store("3").checkpoint("third")
        File(root, "slots/2/checkpoint.json").copyTo(File(root, "slots/2/checkpoint.json.bak"))
        slots.select("3")
        slots.delete("2")
        assertEquals(CheckpointState(null, null, true), slots.store("2").read())
        assertTrue(File(root, "slots/2/checkpoint.json").exists())
        assertFalse(File(root, "slots/2/checkpoint.json.bak").exists())
        assertEquals("first", slots.store("1").read().lastGood)
        assertEquals("third", slots.store("3").read().lastGood)
        slots.delete("3")
        val reopened = open(root)
        assertEquals("3", reopened.current)
        assertEquals(CheckpointState(null, null, true), reopened.store("3").read())
        reopened.store("3").checkpoint("new game")
        assertEquals("new game", reopened.store("3").read().lastGood)
        slots.delete("1")
        assertEquals(CheckpointState(null, null, true), open(root).store("1").read())
        assertThrows(IllegalArgumentException::class.java) { slots.delete("dev") }
        assertThrows(IllegalArgumentException::class.java) { slots.delete("../2") }
    }

    @Test fun corruptSlotDoesNotBlockOtherSlotsOrChangeCurrentOnFailedSelection() {
        val root = directory()
        val slots = open(root)
        slots.store("1").checkpoint("confirmed")
        slots.store("2").checkpoint("other")
        File(root, "slots/2/checkpoint.json").writeText("broken")
        assertThrows(Exception::class.java) { slots.select("2") }
        assertEquals("1", slots.current)
        assertEquals("confirmed", slots.store("1").read().lastGood)
        slots.select("3")
        slots.store("3").checkpoint("third")
        assertEquals("3", open(root).current)
        assertEquals("third", slots.store("3").read().lastGood)
        slots.delete("2")
        assertEquals(CheckpointState(null, null, true), slots.store("2").read())
        assertEquals("confirmed", slots.store("1").read().lastGood)
        slots.select("2")
        slots.store("2").checkpoint("new game")
        assertEquals("new game", slots.store("2").read().lastGood)
    }
}
