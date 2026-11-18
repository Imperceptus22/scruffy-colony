package de.itsolutionskissing.trimpsmobile

import java.security.KeyPairGenerator
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import java.util.Base64
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PrivateAutomationCodeTest {
    @Test fun acceptsOnlyAValidSignatureForThisInstallation() {
        val pair = KeyPairGenerator.getInstance("EC").apply { initialize(ECGenParameterSpec("secp256r1")) }.generateKeyPair()
        val installation = "9d954832-cc14-401a-845e-988c8c169450"
        val message = "scruffy-colony/private-automation/v1:$installation"
        val signature = Signature.getInstance("SHA256withECDSA").run {
            initSign(pair.private)
            update(message.toByteArray())
            sign()
        }
        val code = Base64.getUrlEncoder().withoutPadding().encodeToString(signature)
        val key = Base64.getEncoder().encodeToString(pair.public.encoded)
        assertTrue(PrivateAutomationCode.isValid(installation, code, key))
        assertFalse(PrivateAutomationCode.isValid("1d954832-cc14-401a-845e-988c8c169450", code, key))
        assertFalse(PrivateAutomationCode.isValid(installation, code.replaceRange(0, 1, "A"), key))
        assertFalse(PrivateAutomationCode.isValid(installation, "not a code", key))
    }
}
