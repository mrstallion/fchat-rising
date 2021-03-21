import Foundation
import UserNotifications
import WebKit
import AVFoundation

class Notification: NSObject, WKScriptMessageHandler, UNUserNotificationCenterDelegate {
    let center = UNUserNotificationCenter.current()
    let baseDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
    var webView: WKWebView!

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        center.delegate = self
        self.webView = message.webView
        let data = message.body as! [String: AnyObject]
        let key = data["_id"] as! String
        let callback = { (result: String?) in
            let output = result == nil ? "undefined" : "'\(result!)'";
            DispatchQueue.main.async {
                message.webView!.evaluateJavaScript("nativeMessage('\(key)',\(output))")
            }
        }
        switch(data["_type"] as! String) {
        case "notify":
            notify(data["notify"] as! Bool, data["title"] as! String, data["text"] as! String, data["icon"] as! String, data["sound"] as? String, data["data"] as! String, callback)
        case "requestPermission":
            requestPermission(callback)
        default:
            message.webView!.evaluateJavaScript("nativeError('\(key)',new Error('Unknown message type'))")
            return
        }
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        if(response.actionIdentifier == UNNotificationDefaultActionIdentifier) {
            webView.evaluateJavaScript("document.dispatchEvent(new CustomEvent('notification-clicked',{detail:{data:'\(response.notification.request.content.userInfo["data"]!)'}}))")
        }
        completionHandler()
    }

    func notify(_ notify: Bool, _ title: String, _ text: String, _ icon: String, _ sound: String?, _ data: String, _ cb: (String?) -> Void) {
        if(!notify) {
            if(sound != nil) {
                let player = try! AVAudioPlayer(contentsOf: Bundle.main.url(forResource: "www/sounds/" + sound!, withExtension: "wav")!)
                player.play()
            }
            cb(nil)
            return
        }
        let content = UNMutableNotificationContent()
        content.title = title
        if(sound != nil) {
            content.sound = UNNotificationSound(named: UNNotificationSoundName(Bundle.main.path(forResource: "www/sounds/" + sound!, ofType: "wav")!))
        }
        content.body = text
        content.userInfo["data"] = data
        center.add(UNNotificationRequest(identifier: "1", content: content, trigger: UNTimeIntervalNotificationTrigger.init(timeInterval: 1, repeats: false)))
        cb("1");
    }

    func requestPermission(_ cb: @escaping (String?) -> Void) {
        center.requestAuthorization(options: [.alert, .sound]) { (_, _) in
            cb(nil)
        }
    }
}
