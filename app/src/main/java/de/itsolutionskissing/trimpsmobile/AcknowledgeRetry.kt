package de.itsolutionskissing.trimpsmobile

internal class AcknowledgeRetry(
    private val postDelayed: (Runnable, Long) -> Boolean,
    private val removeCallbacks: (Runnable) -> Unit,
    private val retry: () -> Unit
) {
    private var pending = false
    private var closed = false
    private val task = Runnable { pending = false; if (!closed) retry() }

    fun schedule() {
        if (!closed && !pending) pending = postDelayed(task, 60_000)
    }

    fun close() {
        closed = true
        if (pending) removeCallbacks(task)
        pending = false
    }
}
