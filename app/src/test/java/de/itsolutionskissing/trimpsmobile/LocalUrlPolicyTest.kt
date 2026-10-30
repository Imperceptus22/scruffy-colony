package de.itsolutionskissing.trimpsmobile

import org.junit.Assert.*
import org.junit.Test

class LocalUrlPolicyTest {
    @Test fun gameEntryAllowsOneShotResetQueryWithoutAcceptingOtherAssetsOrOrigins() {
        assertTrue(LocalUrlPolicy.isGameEntry(LocalUrlPolicy.START_URL))
        assertTrue(LocalUrlPolicy.isGameEntry(LocalUrlPolicy.START_URL + "?graphics=classic"))
        assertTrue(LocalUrlPolicy.isGameEntry(LocalUrlPolicy.START_URL + "?graphics=classic#game"))
        assertFalse(LocalUrlPolicy.isGameEntry(LocalUrlPolicy.ORIGIN + "/assets/game/mobile.css"))
        assertFalse(LocalUrlPolicy.isGameEntry("https://example.com/assets/game/index.html?graphics=classic"))
        assertFalse(LocalUrlPolicy.isGameEntry(LocalUrlPolicy.START_URL + "/child"))
        assertFalse(LocalUrlPolicy.isGameEntry("not a url"))
    }

    @Test fun localGameAllowsExactOriginOnly() {
        assertTrue(LocalUrlPolicy.isLocalGame("https://appassets.androidplatform.net/assets/game/index.html"))
        assertTrue(LocalUrlPolicy.isLocalGame("https://appassets.androidplatform.net/assets/game/css/style.css?39"))
        for (url in listOf(
            "https://appassets.androidplatform.net.evil/assets/game/index.html",
            "http://appassets.androidplatform.net/assets/game/index.html",
            "https://appassets.androidplatform.net:444/assets/game/index.html",
            "https://attacker@appassets.androidplatform.net/assets/game/index.html",
            "https://appassets.androidplatform.net/assets/game/../private.txt",
            "https://appassets.androidplatform.net/assets/game/%2e%2e/private.txt",
            "https://example.com/", "file:///tmp/index.html", "content://example/index.html", "not a url"
        )) assertFalse(url, LocalUrlPolicy.isLocalGame(url))
    }
}
