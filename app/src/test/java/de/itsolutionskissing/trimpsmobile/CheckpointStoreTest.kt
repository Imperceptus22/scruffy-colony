package de.itsolutionskissing.trimpsmobile

import androidx.core.util.AtomicFile
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

/** JVM test of the confirmed save and the import rollback; runs in CI with testDebugUnitTest. */
class CheckpointStoreTest {
    @get:Rule val temporary = TemporaryFolder()

    @Test fun emptyDirectoryHasNoSaveAndCheckpointSurvivesReopen() {
        val root = temporary.newFolder()
        assertEquals(CheckpointState(null, null), CheckpointStore(root).read())
        CheckpointStore(root).checkpoint("first")
        CheckpointStore(root).checkpoint("second")
        assertEquals(CheckpointState("second", null), CheckpointStore(root).read())
    }

    @Test fun importKeepsThePreviousSaveUntilCommitAndBlocksAutosaves() {
        val root = temporary.newFolder()
        val store = CheckpointStore(root)
        store.checkpoint("confirmed")
        store.beginImport("confirmed")
        assertEquals(CheckpointState("confirmed", "confirmed"), CheckpointStore(root).read())
        assertThrows(IllegalStateException::class.java) { store.checkpoint("autosave during import") }
        assertThrows(IllegalStateException::class.java) { store.beginImport("second import") }
        store.commit("imported")
        assertEquals(CheckpointState("imported", null), CheckpointStore(root).read())
        assertThrows(IllegalStateException::class.java) { store.commit("no import") }
    }

    @Test fun interruptedImportRestoresTheConfirmedSave() {
        val root = temporary.newFolder()
        val store = CheckpointStore(root)
        store.checkpoint("confirmed")
        store.beginImport("confirmed")
        assertEquals("confirmed", CheckpointStore(root).restoreRollback())
        assertEquals(CheckpointState("confirmed", null), store.read())
        assertNull(store.restoreRollback())
        store.checkpoint("next")
        assertEquals("next", store.read().lastGood)
    }

    @Test fun brokenOrForeignFilesAreRejectedInsteadOfReadAsEmpty() {
        val root = temporary.newFolder()
        val file = File(root, "checkpoint.json")
        for (text in listOf("broken", """{"schema":2,"lastGood":"a","rollback":null}""", """{"schema":1,"lastGood":"a"}""",
            """{"schema":1,"lastGood":5,"rollback":null}""")) {
            file.writeText(text)
            val error = assertThrows(Exception::class.java) { CheckpointStore(root).read() }
            assertTrue(error.toString(), error is org.json.JSONException || error is IllegalArgumentException)
        }
        file.writeBytes(ByteArray(5 * 1024 * 1024 + 1) { ' '.code.toByte() })
        assertThrows(IllegalArgumentException::class.java) { CheckpointStore(root).read() }
    }

    @Test fun tooLargeSaveIsRefusedAndKeepsTheConfirmedOne() {
        val root = temporary.newFolder()
        val store = CheckpointStore(root)
        store.checkpoint("confirmed")
        assertThrows(IllegalArgumentException::class.java) { store.checkpoint("x".repeat(2 * 1024 * 1024 + 1)) }
        assertEquals("confirmed", store.read().lastGood)
    }

    @Test fun unfinishedWriteLeavesTheConfirmedSaveAndLegacyBackupIsRestored() {
        val root = temporary.newFolder()
        CheckpointStore(root).checkpoint("confirmed")
        val atomic = AtomicFile(File(root, "checkpoint.json"))
        val stream = atomic.startWrite()
        stream.write("{\"schema\":1,\"lastGood\":\"half".toByteArray())
        assertEquals("confirmed", CheckpointStore(root).read().lastGood)
        atomic.failWrite(stream)
        assertFalse(File(root, "checkpoint.json.new").exists())
        assertEquals("confirmed", CheckpointStore(root).read().lastGood)
        // Android 8 and 9 wrote through a .bak copy; a save left only there after a crash is still found.
        val base = File(root, "checkpoint.json")
        assertTrue(base.renameTo(File(root, "checkpoint.json.bak")))
        base.writeText("{\"schema\":1,\"lastGood\":\"half")
        assertEquals("confirmed", CheckpointStore(root).read().lastGood)
        assertFalse(File(root, "checkpoint.json.bak").exists())
    }

    @Test fun storesOfTheSameDirectoryShareOneInstance() {
        val root = temporary.newFolder()
        assertSame(CheckpointStore.forDirectory(root), CheckpointStore.forDirectory(File(root, "../" + root.name)))
    }

    @Test fun purchaseReceiptCommitsWithSaveAndSurvivesImportAutosaveAndDeletion() {
        val root = temporary.newFolder()
        val store = CheckpointStore(root)
        store.checkpoint("10 bones")
        store.beginImport("10 bones")
        assertTrue(CheckpointStore(root).read().purchases.isEmpty())
        store.commit("60 bones", "purchase-1" to "bones_25")
        val reopened = CheckpointStore(root)
        assertEquals("60 bones", reopened.read().lastGood)
        assertEquals(mapOf("purchase-1" to "bones_25"), reopened.read().purchases)
        reopened.checkpoint("later")
        reopened.beginImport("later")
        reopened.commit("external import")
        reopened.clear()
        assertEquals(CheckpointState(null, null, true, mapOf("purchase-1" to "bones_25")), CheckpointStore(root).read())
        reopened.checkpoint("new game")
        assertFalse(reopened.read().deleted)
        assertTrue("purchase-1" in reopened.read().purchases)
    }

    @Test fun failedPurchaseCommitCannotLeaveAReceiptWithoutItsSave() {
        val root = temporary.newFolder()
        val store = CheckpointStore(root)
        store.checkpoint("old")
        store.beginImport("old")
        assertThrows(IllegalArgumentException::class.java) { store.commit("x".repeat(2 * 1024 * 1024 + 1), "p" to "") }
        assertEquals(CheckpointState("old", "old"), CheckpointStore(root).read())
        store.restoreRollback()
        assertTrue(store.read().purchases.isEmpty())
    }

    @Test fun deletionMarkerSurvivesReopenUntilANewCheckpoint() {
        val root = temporary.newFolder()
        CheckpointStore(root).checkpoint("deleted-save")
        CheckpointStore(root).clear()
        assertEquals(CheckpointState(null, null, true), CheckpointStore(root).read())
        CheckpointStore(root).checkpoint("new")
        assertEquals(CheckpointState("new", null), CheckpointStore(root).read())
    }
}
