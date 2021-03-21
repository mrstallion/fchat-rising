import Foundation
import WebKit
import AVFoundation

class Background: NSObject, WKScriptMessageHandler {
    var player = try! AVAudioPlayer(contentsOf: Bundle.main.url(forResource: "www/sounds/login", withExtension: "wav")!)

    override init() {
        let session = AVAudioSession.sharedInstance();
        try! session.setCategory(AVAudioSession.Category.playback, options: .mixWithOthers)
        player.volume = 0
        player.numberOfLoops = -1;
        player.play()
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let data = message.body as! [String: AnyObject]
        let key = data["_id"] as! String
        switch(data["_type"] as! String) {
        case "start":
            player.play()
        case "stop":
            player.stop()
        default:
            message.webView!.evaluateJavaScript("nativeError('\(key)',new Error('Unknown message type'))")
            return
        }
        message.webView!.evaluateJavaScript("nativeMessage('\(key)')")
    }
}
