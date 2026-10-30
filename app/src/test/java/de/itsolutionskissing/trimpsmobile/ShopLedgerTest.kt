package de.itsolutionskissing.trimpsmobile

import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

/** JVM test of the bone purchase handling (V-220): one credit per Play purchase token, consumed only once credited. */
class ShopLedgerTest {
    @Test fun committedPurchaseRecoversWithoutTheCreditedMessageEvenAfterSlotDeletion() {
        val root = temporary.newFolder()
        val slots = SlotStore(root, true)
        val before = ShopLedger(root)
        val store = slots.store("2")
        store.checkpoint("10 bones")
        store.beginImport("10 bones")
        store.commit("60 bones", "interrupted" to "bones_25")
        assertTrue(slots.purchaseRecorded("interrupted"))
        slots.delete("2")
        before.recoverCredits()
        val reopened = ShopLedger(root)
        assertTrue(before.isCredited("interrupted"))
        assertTrue(reopened.isCredited("interrupted"))
        assertFalse(reopened.hasBonus("bones_25"))
        assertEquals(PurchaseRules.Action.Consume, PurchaseRules.decide(listOf("bones_25"), true, false, 1, "interrupted", reopened))
        assertNull(slots.store("1").read().lastGood)
    }

    @Test fun uncommittedPurchaseRemainsRetryableAfterRestart() {
        val root = temporary.newFolder()
        CheckpointStore(root).checkpoint("10 bones")
        CheckpointStore(root).beginImport("10 bones")
        val reopened = ShopLedger(root)
        assertFalse(reopened.isCredited("not-committed"))
        assertTrue(PurchaseRules.decide(listOf("bones_25"), true, false, 1, "not-committed", reopened) is PurchaseRules.Action.Grant)
    }
    @get:Rule val temporary = TemporaryFolder()

    @Test fun creditedTokensSurviveReopenAndAreRecordedOnce() {
        val root = temporary.newFolder()
        assertFalse(ShopLedger(root).isCredited("token-a"))
        ShopLedger(root).markCredited("token-a")
        val reopened = ShopLedger(root)
        assertTrue(reopened.isCredited("token-a"))
        reopened.markCredited("token-a")
        assertEquals("{\"credited\":[\"token-a\"]}", File(root, "bone-purchases.json").readText())
    }

    @Test fun aDamagedRecordFailsLoudlyInsteadOfForgettingCredits() {
        // A record that cannot be read must not look empty: every purchase would be credited a second time.
        val root = temporary.newFolder()
        File(root, "bone-purchases.json").writeText("{broken")
        assertThrows(Exception::class.java) { ShopLedger(root) }
    }

    @Test fun purchasedPacksAreGrantedOnceThenConsumed() {
        val ledger = ShopLedger(temporary.newFolder())
        val grant = PurchaseRules.decide(listOf("bones_120"), purchased = true, pending = false, quantity = 1, token = "t1", ledger = ledger)
        assertEquals("first purchase of the pack: its bones once more", PurchaseRules.Action.Grant("bones_120", 260, bonus = true), grant)
        assertEquals("the bonus doubles one pack, not the quantity", PurchaseRules.Action.Grant("bones_25", 75, bonus = true),
            PurchaseRules.decide(listOf("bones_25"), purchased = true, pending = false, quantity = 2, token = "t2", ledger = ledger))
        ledger.markCredited("t1")
        assertEquals(PurchaseRules.Action.Consume,
            PurchaseRules.decide(listOf("bones_120"), purchased = true, pending = false, quantity = 1, token = "t1", ledger = ledger))
    }

    @Test fun pendingUnknownAndMalformedPurchasesGrantNothing() {
        val ledger = ShopLedger(temporary.newFolder())
        assertEquals(PurchaseRules.Action.Wait, PurchaseRules.decide(listOf("bones_300"), false, true, 1, "t", ledger))
        assertEquals(PurchaseRules.Action.Ignore, PurchaseRules.decide(listOf("starter_kit"), true, false, 1, "t", ledger))
        assertEquals(PurchaseRules.Action.Ignore, PurchaseRules.decide(listOf("bones_25", "bones_700"), true, false, 1, "t", ledger))
        assertEquals(PurchaseRules.Action.Ignore, PurchaseRules.decide(listOf("bones_25"), true, false, 0, "t", ledger))
        assertEquals(PurchaseRules.Action.Ignore, PurchaseRules.decide(listOf("bones_25"), true, false, 1, "", ledger))
        assertEquals(PurchaseRules.Action.Ignore, PurchaseRules.decide(listOf("bones_25"), false, false, 1, "t", ledger))
    }

    // The flow between Play and the page, with fake send/consume in place of BillingClient (issue #342).
    private class Fake { val sent = mutableListOf<String>(); val consumed = mutableListOf<String>() }
    private fun flow(ledger: ShopLedger, fake: Fake) = ShopFlow(ledger, { fake.sent += it.optString("event") + ":" + it.optString("token") }, { fake.consumed += it })

    @Test fun aPurchaseIsGrantedOnceConfirmedRecordedAndOnlyThenConsumed() {
        val root = temporary.newFolder(); val fake = Fake(); val ledger = ShopLedger(root); val shop = flow(ledger, fake)
        shop.credited("t1")
        assertTrue("a stray confirmation consumes nothing", fake.consumed.isEmpty())
        shop.purchase(listOf("bones_25"), true, false, 1, "t1")
        shop.purchase(listOf("bones_25"), true, false, 1, "t1")
        assertEquals("one grant per page, also when Play reports it again", listOf("grant:t1"), fake.sent)
        assertTrue(fake.consumed.isEmpty())
        shop.credited("t1")
        assertTrue(ShopLedger(root).isCredited("t1")); assertEquals(listOf("t1"), fake.consumed)
        shop.credited("t1"); assertEquals("a second confirmation changes nothing", listOf("t1"), fake.consumed)
        shop.purchase(listOf("bones_25"), true, false, 1, "t1")
        assertEquals("a recorded token is only consumed again (consume failed earlier)", listOf("t1", "t1"), fake.consumed)
    }

    @Test fun aNewPageGetsOpenGrantsAgainAndPendingPurchasesWait() {
        val fake = Fake(); val shop = flow(ShopLedger(temporary.newFolder()), fake)
        shop.purchase(listOf("bones_120"), true, false, 1, "t2")
        shop.newPage()
        shop.purchase(listOf("bones_120"), true, false, 1, "t2")
        assertEquals("reload or slot switch: the open purchase reaches the new page", listOf("grant:t2", "grant:t2"), fake.sent)
        shop.purchase(listOf("bones_300"), false, true, 1, "t3")
        assertEquals("pending:", fake.sent.last()); assertTrue(fake.consumed.isEmpty())
    }

    @Test fun anUnwrittenRecordNeitherConsumesNorGrantsAgainInThisRun() {
        val root = temporary.newFolder(); val fake = Fake(); val ledger = ShopLedger(root); val shop = flow(ledger, fake)
        shop.purchase(listOf("bones_700"), true, false, 1, "t4")
        // A directory where AtomicFile writes its new file makes the record fail on every platform.
        assertTrue(File(root, "bone-purchases.json.new").mkdir())
        shop.credited("t4")
        assertFalse(ledger.isCredited("t4"))
        assertTrue("not consumed without a record", fake.consumed.isEmpty())
        shop.purchase(listOf("bones_700"), true, false, 1, "t4")
        assertEquals("not granted twice in this run", 1, fake.sent.count { it == "grant:t4" })
    }

    @Test fun packsMatchTheApprovedOffer() {
        // bones_120 holds 130 bones (V-201 step 2): no pack gives fewer bones per euro than a smaller one.
        assertEquals(mapOf("bones_25" to 25, "bones_120" to 130, "bones_300" to 300, "bones_700" to 700), BonePacks.bones)
        assertEquals(mapOf("starter_pack" to 100, "supporter_pack" to 150), BonePacks.oneTime)
        assertEquals(mapOf("bone_jar" to 150), BonePacks.jar)
    }

    @Test fun theBoneJarIsAFixedConsumableWithoutBonus() {
        val ledger = ShopLedger(temporary.newFolder())
        assertFalse(ledger.hasBonus("bone_jar"))
        assertEquals(PurchaseRules.Action.Grant("bone_jar", 150), PurchaseRules.decide(listOf("bone_jar"), true, false, 1, "j1", ledger))
        ledger.markCredited("j1")
        assertEquals(PurchaseRules.Action.Consume, PurchaseRules.decide(listOf("bone_jar"), true, false, 1, "j1", ledger))
    }

    @Test fun aCreditedButUnacknowledgedPackIsOwnedAndAcknowledgedAgain() {
        val fake = Fake(); val acknowledged = mutableListOf<String>(); val ledger = ShopLedger(temporary.newFolder())
        ledger.markCredited("s9")
        val shop = ShopFlow(ledger, { fake.sent += it.optString("event") + ":" + it.optString("product") }, { fake.consumed += it }) { acknowledged += it }
        shop.purchase(listOf("starter_pack"), true, false, 1, "s9")
        assertEquals(listOf("entitled:starter_pack"), fake.sent); assertEquals(listOf("s9"), acknowledged); assertTrue(fake.consumed.isEmpty())
    }

    @Test fun anUnwrittenRecordNeitherAcknowledgesNorUsesTheBonus() {
        val root = temporary.newFolder(); val fake = Fake(); val acknowledged = mutableListOf<String>(); val ledger = ShopLedger(root)
        val shop = ShopFlow(ledger, { fake.sent += it.optString("event") + ":" + it.optString("product") }, { fake.consumed += it }) { acknowledged += it }
        shop.purchase(listOf("supporter_pack"), true, false, 1, "s8"); shop.purchase(listOf("bones_700"), true, false, 1, "c8")
        assertTrue(File(root, "bone-purchases.json.new").mkdir())
        shop.credited("s8"); shop.credited("c8")
        assertTrue(acknowledged.isEmpty()); assertTrue(fake.consumed.isEmpty())
        assertFalse("no entitlement without a record", fake.sent.contains("entitled:supporter_pack"))
        assertTrue("the bonus stays available", ledger.hasBonus("bones_700"))
        shop.purchase(listOf("supporter_pack"), true, false, 1, "s8")
        assertEquals("not granted twice in this run", 1, fake.sent.count { it == "grant:supporter_pack" })
    }

    @Test fun theFirstPurchaseBonusIsUsedOncePerPackAndSurvivesReopen() {
        val root = temporary.newFolder(); val ledger = ShopLedger(root)
        assertTrue(ledger.hasBonus("bones_300")); assertFalse("one-time packs have no bonus", ledger.hasBonus("starter_pack"))
        ledger.markCredited("t1", "bones_300")
        val reopened = ShopLedger(root)
        assertFalse(reopened.hasBonus("bones_300")); assertTrue(reopened.hasBonus("bones_700"))
        assertEquals(PurchaseRules.Action.Grant("bones_300", 300),
            PurchaseRules.decide(listOf("bones_300"), true, false, 1, "t2", reopened))
        val record = org.json.JSONObject(File(root, "bone-purchases.json").readText())
        assertEquals("[\"t1\"]", record.getJSONArray("credited").toString()); assertEquals("[\"bones_300\"]", record.getJSONArray("bonus").toString())
    }

    @Test fun oneTimePacksAreCreditedOnceThenAcknowledgedAndOwned() {
        val ledger = ShopLedger(temporary.newFolder())
        assertEquals("exactly the pack, no bonus, no quantity", PurchaseRules.Action.Grant("starter_pack", 100),
            PurchaseRules.decide(listOf("starter_pack"), true, false, 2, "s1", ledger))
        ledger.markCredited("s1")
        assertEquals(PurchaseRules.Action.Acknowledge, PurchaseRules.decide(listOf("starter_pack"), true, false, 1, "s1", ledger))
        // Acknowledged at Play: bought before (also on another device or after a reinstall), owned without bones.
        assertEquals(PurchaseRules.Action.Owned("supporter_pack"),
            PurchaseRules.decide(listOf("supporter_pack"), true, false, 1, "s2", ShopLedger(temporary.newFolder()), acknowledged = true))
    }

    @Test fun aOneTimePackIsAcknowledgedNotConsumedAndReportedAsOwned() {
        val fake = Fake(); val acknowledged = mutableListOf<String>(); val ledger = ShopLedger(temporary.newFolder())
        val shop = ShopFlow(ledger, { fake.sent += it.optString("event") + ":" + it.optString("token") + it.optString("product") }, { fake.consumed += it }) { acknowledged += it }
        shop.purchase(listOf("supporter_pack"), true, false, 1, "s3")
        shop.credited("s3")
        assertEquals(listOf("s3"), acknowledged); assertTrue(fake.consumed.isEmpty())
        assertEquals(listOf("grant:s3supporter_pack", "entitled:supporter_pack"), fake.sent)
        shop.purchase(listOf("supporter_pack"), true, false, 1, "s3", acknowledged = true)
        assertEquals("entitled:supporter_pack", fake.sent.last()); assertEquals(listOf("s3"), acknowledged)
        // A consumable with its first-purchase bonus records the bonus with the credit.
        shop.purchase(listOf("bones_25"), true, false, 1, "c1"); shop.credited("c1")
        assertFalse(ledger.hasBonus("bones_25")); assertEquals(listOf("c1"), fake.consumed)
    }
}
