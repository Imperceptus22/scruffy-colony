package de.itsolutionskissing.trimpsmobile

import java.net.URI

object LocalUrlPolicy {
    const val ORIGIN = "https://appassets.androidplatform.net"
    const val START_URL = "$ORIGIN/assets/game/index.html"

    fun isGameEntry(url: String): Boolean = isLocalGame(url) && URI(url).path == "/assets/game/index.html"

    fun isLocalGame(url: String): Boolean = try {
        val uri = URI(url)
        val path = uri.path.orEmpty()
        uri.scheme == "https" && uri.host == "appassets.androidplatform.net" &&
            uri.userInfo == null && (uri.port == -1 || uri.port == 443) &&
            path.startsWith("/assets/game/") && '\\' !in path &&
            path.split('/').none { it == "." || it == ".." }
    } catch (_: Exception) { false }
}
