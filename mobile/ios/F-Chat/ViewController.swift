import UIKit
import WebKit
import AVFoundation

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    var webView: WKWebView!
    let profileRegex = try! NSRegularExpression(pattern: "^https?://(www\\.)?f-list.net/c/([^/#]+)/?#?", options: [.caseInsensitive])

    override func loadView() {
        let config = WKWebViewConfiguration()
        let controller = WKUserContentController()
        let scriptPath = Bundle.main.path(forResource: "native", ofType: "js")
        let js = try! String(contentsOfFile: scriptPath!)
        let userScript = WKUserScript(source: js, injectionTime: WKUserScriptInjectionTime.atDocumentStart, forMainFrameOnly: false)
        controller.addUserScript(userScript)
        controller.addUserScript(WKUserScript(source: "window.setupPlatform('ios')", injectionTime: WKUserScriptInjectionTime.atDocumentEnd, forMainFrameOnly: false))
        controller.add(File(), name: "File")
        controller.add(Notification(), name: "Notification")
        controller.add(Background(), name: "Background")
        controller.add(Logs(), name: "Logs")
        config.userContentController = controller
        config.mediaTypesRequiringUserActionForPlayback = [.video]
        if #available(iOS 12.2, *) {
            config.setValue(true, forKey: "alwaysRunsAtForegroundPriority")
        } else {
            config.setValue(true, forKey: "_alwaysRunsAtForegroundPriority")
        }
        webView = WKWebView(frame: UIApplication.shared.windows[0].frame, configuration: config)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        view = webView
        NotificationCenter.default.addObserver(self, selector: #selector(ViewController.keyboardWillShow), name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(ViewController.keyboardDidShow), name: UIResponder.keyboardDidShowNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(ViewController.keyboardWillHide), name: UIResponder.keyboardWillHideNotification, object: nil)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        UIApplication.shared.statusBarStyle = .lightContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let htmlPath = Bundle.main.path(forResource: "www/index", ofType: "html")
        let url = URL(fileURLWithPath: htmlPath!, isDirectory: false)
        webView.loadFileURL(url, allowingReadAccessTo: url)
    }

    @objc func keyboardWillShow(notification: NSNotification) {
        let info = notification.userInfo!
        let newHeight = view.window!.frame.height - (info[UIResponder.keyboardFrameEndUserInfoKey] as! NSValue).cgRectValue.height
        UIView.animate(withDuration: (info[UIResponder.keyboardAnimationDurationUserInfoKey] as! NSNumber).doubleValue, animations: {
            self.webView.frame = CGRect(x: 0, y: 0, width: self.webView.frame.width, height: newHeight)
        })
    }

    @objc func keyboardDidShow(notification: NSNotification) {
        webView.scrollView.contentInset = UIEdgeInsets(top: 0, left: 0, bottom: webView.scrollView.contentInset.bottom - webView.scrollView.adjustedContentInset.bottom, right: 0)
    }

    @objc func keyboardWillHide(notification: NSNotification) {
        let info = notification.userInfo!
        UIView.animate(withDuration: (info[UIResponder.keyboardAnimationDurationUserInfoKey] as! NSNumber).doubleValue, animations: {
            self.webView.frame = UIApplication.shared.windows[0].frame
        })
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping () -> Void) {
        let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alertController.addAction(UIAlertAction(title: NSLocalizedString("OK", comment: "OK"), style: .default, handler: { (action) in completionHandler() }))
        present(alertController, animated: true, completion: nil)
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (Bool) -> Void) {
        let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alertController.addAction(UIAlertAction(title: NSLocalizedString("OK", comment: "OK"), style: .default, handler: { (action) in completionHandler(true) }))
        alertController.addAction(UIAlertAction(title: NSLocalizedString("Cancel", comment: "Cancel"), style: .cancel, handler: { (action) in completionHandler(false) }))
        present(alertController, animated: true, completion: nil)
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = navigationAction.request.url!
        if(url.isFileURL) {
            decisionHandler(.allow)
            return
        }
        decisionHandler(.cancel)
        let str = url.absoluteString
        if(url.scheme == "data") {
            let start = str.firstIndex(of: ",")!
            let file = FileManager.default.temporaryDirectory.appendingPathComponent(str[str.index(str.startIndex, offsetBy: 5)..<start].removingPercentEncoding!)
            try! str.suffix(from: str.index(after: start)).removingPercentEncoding!.write(to: file, atomically: false, encoding: .utf8)
            let controller = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            controller.popoverPresentationController?.sourceView = webView
            controller.popoverPresentationController?.sourceRect = CGRect(origin: webView.bounds.origin, size: CGSize(width: 0, height: 0))
            self.present(controller, animated: true, completion: nil)
            return
        }
        let match = profileRegex.matches(in: str, range: NSRange(location: 0, length: str.count))
        if(match.count == 1) {
            let char = str[Range(match[0].range(at: 2), in: str)!].removingPercentEncoding!;
            webView.evaluateJavaScript("document.dispatchEvent(new CustomEvent('open-profile',{detail:'\(char)'}))", completionHandler: nil)
            return
        }
        UIApplication.shared.open(navigationAction.request.url!)
    }
}
