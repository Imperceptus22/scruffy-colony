plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "de.itsolutionskissing.trimpsmobile"
    compileSdk = 36
    defaultConfig {
        // Package name of the existing Play Console entry "Scruffy Colony". Kotlin packages and the namespace keep
        // the old name: they are internal and need no change. A new package name is a separate app on the device.
        applicationId = "de.itsolutionskissing.scruffycolony"
        minSdk = 26
        targetSdk = 36
        versionCode = 88
        versionName = "1.00"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    buildFeatures { buildConfig = true }
    // AtomicFile only logs through android.util.Log; in JVM tests the log calls do nothing. Note: every other Android
    // API also returns 0/null/false here instead of failing, so JVM tests must not rely on Android framework calls.
    testOptions { unitTests.isReturnDefaultValues = true }
    sourceSets.getByName("androidTest").assets.srcDir(rootProject.file("tests/fixtures"))
    signingConfigs {
        val releaseStore = providers.environmentVariable("TRIMPS_RELEASE_KEYSTORE").orNull
        if (releaseStore != null) {
            create("production") {
                storeFile = file(releaseStore)
                storePassword = providers.environmentVariable("TRIMPS_RELEASE_PASSWORD").get()
                keyAlias = "trimps-release"
                keyPassword = storePassword
            }
        }
        create("preview") {
            storeFile = file("signing/preview.keystore")
            storePassword = "android"
            keyAlias = "trimps-preview"
            keyPassword = "android"
        }
    }
    buildTypes {
        getByName("release") {
            isDebuggable = false
            signingConfig = signingConfigs.findByName("production")
        }
        create("preview") {
            initWith(getByName("debug"))
            signingConfig = signingConfigs.getByName("preview")
            applicationIdSuffix = ".preview"
            versionNameSuffix = "-preview"
            matchingFallbacks += "debug"
        }
    }
}
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
dependencies {
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("androidx.activity:activity:1.10.1")
    // AtomicFile of androidx (same file format as the platform one) lets the save stores run in JVM unit tests.
    implementation("androidx.core:core:1.13.0")
    // V-220: bone packs through Google Play; 8.x is the version Play currently requires.
    implementation("com.android.billingclient:billing:8.3.0")
    // Billing brings Fragment 1.1; Activity Result APIs (save import/export) need at least 1.3 (lint).
    implementation("androidx.fragment:fragment:1.8.9")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20240303")
    androidTestImplementation("androidx.test:runner:1.6.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
}
