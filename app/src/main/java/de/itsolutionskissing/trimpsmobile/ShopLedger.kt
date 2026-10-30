package de.itsolutionskissing.trimpsmobile

import androidx.core.util.AtomicFile
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileNotFoundException

/** Bone packs of the Play Console (approved 26.10.2026): product id and bones per pack. */
object BonePacks {
    /** Consumables, consumed after the credit. bones_120 holds 130 bones, so the ladder never loses value per euro. */
    val bones: Map<String, Int> = linkedMapOf("bones_25" to 25, "bones_120" to 130, "bones_300" to 300, "bones_700" to 700)
    /** One-time packs, acknowledged after the credit and owned for the Play account; their bones are credited once. */
    val oneTime: Map<String, Int> = linkedMapOf("starter_pack" to 100, "supporter_pack" to 150)
    /** The Bone Jar (decision 28.10.2026): a consumable with a fixed 150 bones and no first-purchase bonus. The page
     *  offers it only when its jar is full; what a purchase credits is decided here, never by the page. */
    val jar: Map<String, Int> = linkedMapOf("bone_jar" to 150)
    val all: Map<String, Int> = LinkedHashMap(bones).apply { putAll(oneTime); putAll(jar) }
}

/**
 * Purchase tokens whose bones are in the game (V-220). A token is recorded only after the game confirmed the credit and
 * saved it; only then is the purchase consumed at Google Play. The original save keeps no fields of its own, so this
 * app-side record and receipts committed atomically with each checkpoint prevent a second credit after interruption.
 */
class ShopLedger(private val dir: File) {
    private val file = AtomicFile(File(dir, "bone-purchases.json"))
    private val credited = linkedSetOf<String>()
    // Consumable packs whose first-purchase bonus is used. Kept on this device only: a reinstall offers it again
    // (in the player's favour, accepted residual risk; Play keeps no history of consumed purchases).
    private val bonusUsed = linkedSetOf<String>()

    init {
        try {
            val record = JSONObject(String(file.readFully(), Charsets.UTF_8))
            for ((key, target) in listOf("credited" to credited, "bonus" to bonusUsed)) {
                val list = record.optJSONArray(key) ?: JSONArray()
                for (i in 0 until list.length()) list.optString(i).takeIf { it.isNotEmpty() }?.let(target::add)
            }
        } catch (_: FileNotFoundException) {
        }
        recoverCredits()
    }

    /** Recover the gap between the atomic save/receipt commit and the page's credited message. */
    @Synchronized fun recoverCredits() {
        for (root in listOf(dir, File(dir, "slots/2"), File(dir, "slots/3"), File(dir, "slots/dev"))) {
            for ((token, bonus) in CheckpointStore.forDirectory(root).read().purchases) {
                markCredited(token, bonus.takeIf { it.isNotEmpty() })
            }
        }
    }

    @Synchronized fun isCredited(token: String) = token in credited

    @Synchronized fun hasBonus(product: String) = product in BonePacks.bones && product !in bonusUsed

    /** Records the credit and, for a first purchase, the used bonus in one write. */
    @Synchronized fun markCredited(token: String, bonusProduct: String? = null) {
        if (token in credited) return
        val next = LinkedHashSet(credited).apply { add(token) }
        val nextBonus = LinkedHashSet(bonusUsed).apply { bonusProduct?.let(::add) }
        val record = JSONObject().put("credited", JSONArray(next.toList()))
        if (nextBonus.isNotEmpty()) record.put("bonus", JSONArray(nextBonus.toList()))
        val out = file.startWrite()
        try {
            out.write(record.toString().toByteArray(Charsets.UTF_8))
            file.finishWrite(out)
        } catch (e: Exception) {
            file.failWrite(out)
            throw e
        }
        credited.add(token)
        bonusProduct?.let(bonusUsed::add)
    }
}

/** What to do with a purchase Play reports, independent of the billing library so it can be tested on the JVM. */
object PurchaseRules {
    sealed class Action {
        /** bonus: the first purchase of this consumable pack, whose bones count twice once (Erstkauf-Bonus). */
        data class Grant(val product: String, val bones: Int, val bonus: Boolean = false) : Action()
        object Consume : Action()
        object Acknowledge : Action()
        /** A one-time pack bought earlier (acknowledged): owned for this account, no bones again. */
        data class Owned(val product: String) : Action()
        object Wait : Action()
        object Ignore : Action()
    }

    fun decide(products: List<String>, purchased: Boolean, pending: Boolean, quantity: Int, token: String, ledger: ShopLedger,
               acknowledged: Boolean = false): Action {
        val product = products.singleOrNull() ?: return Action.Ignore
        val bones = BonePacks.all[product] ?: return Action.Ignore
        if (token.isEmpty() || quantity < 1) return Action.Ignore
        if (pending) return Action.Wait
        if (!purchased) return Action.Ignore
        if (product in BonePacks.oneTime) return when {
            // Acknowledged means credited before, on this or another device: the pack is owned, its bones stay single.
            acknowledged -> Action.Owned(product)
            ledger.isCredited(token) -> Action.Acknowledge
            else -> Action.Grant(product, bones)
        }
        if (ledger.isCredited(token)) return Action.Consume
        val bonus = ledger.hasBonus(product)
        return Action.Grant(product, bones * quantity + if (bonus) bones else 0, bonus)
    }
}

/**
 * The purchase flow between Play and the page, without the billing library (JVM tests, V-220 review): a token is granted
 * to the current page once, confirmed only if it was granted, recorded, and only then consumed.
 */
class ShopFlow(private val ledger: ShopLedger, private val send: (JSONObject) -> Unit, private val consume: (String) -> Unit,
               private val acknowledge: (String) -> Unit = {}) {
    private val granted = mutableMapOf<String, PurchaseRules.Action.Grant>()
    private val handled = mutableSetOf<String>()

    /** A new page (load, reload, slot switch) has its own empty record of handled grants: send open purchases again. */
    fun newPage() { granted.clear(); handled.clear() }

    fun purchase(products: List<String>, purchased: Boolean, pending: Boolean, quantity: Int, token: String, acknowledged: Boolean = false) {
        when (val action = PurchaseRules.decide(products, purchased, pending, quantity, token, ledger, acknowledged)) {
            is PurchaseRules.Action.Grant -> if (handled.add(token)) {
                granted[token] = action
                send(JSONObject().put("event", "grant").put("token", token).put("product", action.product)
                    .put("bones", action.bones).put("bonus", action.bonus))
            }
            PurchaseRules.Action.Consume -> consume(token)
            PurchaseRules.Action.Acknowledge -> { entitled(products.single()); acknowledge(token) }
            is PurchaseRules.Action.Owned -> entitled(action.product)
            PurchaseRules.Action.Wait -> send(JSONObject().put("event", "pending"))
            PurchaseRules.Action.Ignore -> {}
        }
    }

    private fun entitled(product: String) = send(JSONObject().put("event", "entitled").put("product", product))

    /** Only a token granted to this page can be confirmed; a stray message changes nothing. */
    fun credited(token: String) {
        val grant = granted.remove(token) ?: return
        try {
            ledger.markCredited(token, grant.product.takeIf { grant.bonus })
        } catch (e: Exception) {
            // The checkpoint receipt survives; a later page or purchase refresh retries the ledger before delivery.
            return
        }
        if (grant.product in BonePacks.oneTime) { entitled(grant.product); acknowledge(token) } else consume(token)
    }
}
