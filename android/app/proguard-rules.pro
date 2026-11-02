# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
-keepattributes *Annotation*
-keepattributes JavascriptInterface

# Keep all Capacitor plugins and bridge interfaces
-keep public class * extends com.getcapacitor.Plugin
-keep public class com.getcapacitor.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn com.getcapacitor.**

# Google Play Services & AdMob
-keep public class com.google.android.gms.ads.** { public *; }
-keep public class com.google.ads.** { public *; }
-dontwarn com.google.android.gms.**

# Cordova / Capacitor plugins
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**
