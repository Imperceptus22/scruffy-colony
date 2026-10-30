package de.itsolutionskissing.trimpsmobile

import java.util.concurrent.Executors

/** One process-wide queue survives Activity recreation; UI replies belong to their originating view. */
object SaveOperationQueue {
    private val executor = Executors.newSingleThreadExecutor()
    fun submit(operation: () -> Unit) { executor.execute(operation) }
}
