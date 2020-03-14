package net.f_list.fchat

import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.webkit.JavascriptInterface

class Background(private val ctx: Context) {
	private val serviceIntent: Intent by lazy { Intent(ctx, BackgroundService::class.java) }
	private val powerManager: PowerManager by lazy { ctx.getSystemService(Context.POWER_SERVICE) as PowerManager }
	private var wakeLock: PowerManager.WakeLock? = null

	@JavascriptInterface
	fun start() {
		wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "fchat")
		wakeLock!!.acquire()
		ctx.startService(serviceIntent)
	}

	@JavascriptInterface
	fun stop() {
		if(wakeLock != null && wakeLock!!.isHeld) wakeLock!!.release()
		ctx.stopService(serviceIntent)
	}
}