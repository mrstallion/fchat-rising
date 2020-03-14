import Foundation
import WebKit

class IndexItem: Encodable {
    let name: String
    var dates = NSMutableOrderedSet()
    var offsets = [UInt64]()
    init(_ name: String) {
        self.name = name
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(name, forKey: .name)
        try container.encode(dates.array as! [UInt16], forKey: .dates)
    }

    private enum CodingKeys: String, CodingKey {
        case name
        case dates
    }
}

class Logs: NSObject, WKScriptMessageHandler {
    let fm = FileManager.default;
    let baseDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
    var buffer = UnsafeMutableRawPointer.allocate(byteCount: 51000, alignment: 1)
    var logDir: URL!
    var character: String?
    var index: [String: IndexItem]!
    var loadedIndex: [String: IndexItem]!

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        let data = message.body as! [String: AnyObject]
        let key = data["_id"] as! String
        do {
            var result: String?
            switch(data["_type"] as! String) {
            case "init":
                result = try initCharacter(data["character"] as! String)
            case "loadIndex":
                result = try loadIndex(data["character"] as! String)
            case "getCharacters":
                result = try getCharacters()
            case "logMessage":
                try logMessage(data["key"] as! String, data["conversation"] as! NSString, (data["time"] as! NSNumber).uint32Value, (data["type"] as! NSNumber).uint8Value, data["sender"] as! NSString, data["message"] as! NSString)
            case "getBacklog":
                result = try getBacklog(data["key"] as! String)
            case "getLogs":
                result = try getLogs(data["character"] as! String, data["key"] as! String, (data["date"] as! NSNumber).uint16Value)
            case "repair":
                try repair(data["character"] as! String)
            default:
                message.webView!.evaluateJavaScript("nativeError('\(key)',new Error('Unknown message type'))")
                return
            }
            let output = result == nil ? "undefined" : result!;
            message.webView!.evaluateJavaScript("nativeMessage('\(key)',\(output))")
        } catch(let error) {
            message.webView!.evaluateJavaScript("nativeError('\(key)',new Error('Logs-\(data["_type"]!): \(error.localizedDescription)'))")
        }
    }

    func getIndex(_ character: String) throws -> [String: IndexItem] {
        var index = [String: IndexItem]()
        let files = try fm.contentsOfDirectory(at: baseDir.appendingPathComponent("\(character)/logs", isDirectory: true), includingPropertiesForKeys: nil, options: [.skipsHiddenFiles])
        for file in files {
            if(!file.lastPathComponent.hasSuffix(".idx")) { continue }
            let data = NSData(contentsOf: file)!
            var nameLength = 0
            data.getBytes(&nameLength, length: 1)
            let name = String(data: data.subdata(with: NSMakeRange(1, nameLength)), encoding: .utf8)!
            var offset = nameLength + 1
            let indexItem = IndexItem(name)
            if (data.length - offset) % 7 != 0 { throw NSError(domain: "Log corruption", code: 0) }
            while offset < data.length {
                var date: UInt16 = 0
                data.getBytes(&date, range: NSMakeRange(offset, 2))
                var o: UInt64 = 0
                data.getBytes(&o, range: NSMakeRange(offset + 2, 5))
                indexItem.dates.add(date)
                indexItem.offsets.append(o)
                offset += 7
            }
            index[file.deletingPathExtension().lastPathComponent] = indexItem
        }
        return index
    }

    func initCharacter(_ name: String) throws -> String {
        logDir = baseDir.appendingPathComponent("\(name)/logs", isDirectory: true)
        try fm.createDirectory(at: logDir, withIntermediateDirectories: true, attributes: nil)
        index = try getIndex(name)
        loadedIndex = index
        character = name
        return String(data: try JSONEncoder().encode(index), encoding: .utf8)!
    }

    func getCharacters() throws -> String {
        let entries = try fm.contentsOfDirectory(at: baseDir, includingPropertiesForKeys: nil, options: [.skipsHiddenFiles]).filter {
            try $0.resourceValues(forKeys: [.isDirectoryKey]).isDirectory == true
        }.map { $0.lastPathComponent }
        return String(data: try JSONSerialization.data(withJSONObject: entries), encoding: .utf8)!;
    }

    func logMessage(_ key: String, _ conversation: NSString, _ time: UInt32, _ type: UInt8, _ sender: NSString, _ text: NSString) throws {
        var time = time
        var type = type
        var day = UInt16(time / 86400)
        let url = logDir.appendingPathComponent(key, isDirectory: false);
        var indexItem = index![key]
        if(indexItem == nil) { fm.createFile(atPath: url.path, contents: nil) }
        let fd = try FileHandle(forWritingTo: url)
        fd.seekToEndOfFile()
        if(!(indexItem?.dates.contains(day) ?? false)) {
            let indexFile = url.appendingPathExtension("idx")
            if(indexItem == nil) { fm.createFile(atPath: indexFile.path, contents: nil) }
            let indexFd = try FileHandle(forWritingTo: indexFile)
            indexFd.seekToEndOfFile()
            if(indexItem == nil) {
                indexItem = IndexItem(conversation as String)
                index![key] = indexItem
                let cstring = conversation.utf8String
                var length = strlen(cstring!)
                write(indexFd.fileDescriptor, &length, 1)
                write(indexFd.fileDescriptor, cstring, length)
            }
            write(indexFd.fileDescriptor, &day, 2)
            var offset = fd.offsetInFile
            write(indexFd.fileDescriptor, &offset, 5)
            indexItem!.dates.add(day)
            indexItem!.offsets.append(offset)
        }
        let start = fd.offsetInFile
        write(fd.fileDescriptor, &time, 4)
        write(fd.fileDescriptor, &type, 1)
        var cstring = sender.utf8String
        var length = strlen(cstring!)
        write(fd.fileDescriptor, &length, 1)
        write(fd.fileDescriptor, cstring, length)
        cstring = text.utf8String
        length = strlen(cstring!)
        write(fd.fileDescriptor, &length, 2)
        write(fd.fileDescriptor, cstring, length)
        var size = fd.offsetInFile - start
        write(fd.fileDescriptor, &size, 2)
    }

    func getBacklog(_ key: String) throws -> String {
        let url = logDir.appendingPathComponent(key, isDirectory: false)
        if(!fm.fileExists(atPath: url.path)) { return "[]" }
        let file = try FileHandle(forReadingFrom: url)
        file.seekToEndOfFile()
        var strings = [String]()
        strings.reserveCapacity(20)
        while file.offsetInFile > 0 && strings.count < 20 {
            file.seek(toFileOffset: file.offsetInFile - 2)
            read(file.fileDescriptor, buffer, 2)
            let length = buffer.load(as: UInt16.self)
            if(length > file.offsetInFile - 2) { throw NSError(domain: "Log corruption", code: 0) }
            let newOffset = file.offsetInFile - UInt64(length + 2)
            file.seek(toFileOffset: newOffset)
            read(file.fileDescriptor, buffer, Int(length))
            strings.append(try deserializeMessage(buffer, 0).0)
            file.seek(toFileOffset: newOffset)
        }
        return "[" + strings.reversed().joined(separator: ",") + "]"
    }

    func getLogs(_ character: String, _ key: String, _ date: UInt16) throws -> String {
        let index = loadedIndex![key]
        guard let indexKey = index?.dates.index(of: date) else { return "[]" }
        let url = baseDir.appendingPathComponent("\(character)/logs/\(key)", isDirectory: false)
        let file = try FileHandle(forReadingFrom: url)
        let start = index!.offsets[indexKey]
        let end = indexKey >= index!.offsets.count - 1 ? file.seekToEndOfFile() : index!.offsets[indexKey + 1]
        file.seek(toFileOffset: start)
        let length = Int(end - start)
        let buffer = UnsafeMutableRawPointer.allocate(byteCount: length, alignment: 1)
        read(file.fileDescriptor, buffer, length)
        var json = "["
        var offset = 0
        while offset < length {
            let deserialized = try deserializeMessage(buffer, offset)
            offset = deserialized.1 + 2
            json += deserialized.0 + ","
        }
        return json + "]"
    }

    func loadIndex(_ name: String) throws -> String {
        loadedIndex = name == character ? index : try getIndex(name)
        return String(data: try JSONEncoder().encode(loadedIndex), encoding: .utf8)!
    }

    func decodeString(_ buffer: UnsafeMutableRawPointer, _ offset: Int, _ length: Int) -> String? {
        return String(bytesNoCopy: buffer.advanced(by: offset), length: length, encoding: .utf8, freeWhenDone: false)
    }

    func deserializeMessage(_ buffer: UnsafeMutableRawPointer, _ o: Int) throws -> (String, Int) {
        var offset = o
        let date = buffer.advanced(by: offset).bindMemory(to: UInt32.self, capacity: 1).pointee
        let type = buffer.load(fromByteOffset: offset + 4, as: UInt8.self)
        let senderLength = Int(buffer.load(fromByteOffset: offset + 5, as: UInt8.self))
        guard let sender = decodeString(buffer, offset + 6, senderLength) else {
            throw NSError(domain: "Log corruption", code: 0)
        }
        offset += senderLength + 6
        let textLength = Int(buffer.advanced(by: offset).bindMemory(to: UInt16.self, capacity: 1).pointee)
        guard let text = decodeString(buffer, offset + 2, textLength) else {
            throw NSError(domain: "Log corruption", code: 0)
        }
        return ("{\"time\":\(date),\"type\":\(type),\"sender\":\(File.escape(sender)),\"text\":\(File.escape(text))}", offset + textLength + 2)
    }

    func repair(_ character: String) throws {
        let files = try fm.contentsOfDirectory(at: baseDir.appendingPathComponent("\(character)/logs", isDirectory: true), includingPropertiesForKeys: nil, options: [.skipsHiddenFiles])
        for file in files {
            if(file.lastPathComponent.hasSuffix(".idx")) { continue }
            let indexFd = try FileHandle(forUpdating: file.appendingPathExtension("idx"))
            read(indexFd.fileDescriptor, buffer, 1)
            indexFd.truncateFile(atOffset: UInt64(buffer.load(as: UInt8.self) + 1))
            let fd = try FileHandle(forUpdating: file)
            let size = fd.seekToEndOfFile()
            fd.seek(toFileOffset: 0)
            var lastDay = 0, pos = UInt64(0)
            do {
                while fd.offsetInFile < size {
                    pos = fd.offsetInFile
                    let max = read(fd.fileDescriptor, buffer, 51000)
                    var offset = 0
                    while offset + 10 < max {
                        let day = buffer.advanced(by: offset).bindMemory(to: UInt32.self, capacity: 1).pointee / 86400
                        let senderLength = Int(buffer.load(fromByteOffset: offset + 5, as: UInt8.self))
                        if offset + senderLength + 10 > max { break }
                        let sender = decodeString(buffer, offset + 6, senderLength)
                        let textLength = Int(buffer.advanced(by: offset + senderLength + 6).bindMemory(to: UInt16.self, capacity: 1).pointee)
                        if(offset + senderLength + textLength + 10 > max) { break }
                        let text = decodeString(buffer, offset + senderLength + 8, textLength)
                        let mark = senderLength + textLength + 8
                        let size = buffer.advanced(by: offset + mark).bindMemory(to: UInt16.self, capacity: 1).pointee
                        if(size != mark || sender == nil || text == nil) { throw NSError(domain: "", code: 0) }
                        if(day > lastDay) {
                            lastDay = Int(day)
                            write(indexFd.fileDescriptor, &lastDay, 2)
                            write(indexFd.fileDescriptor, &pos, 5)
                        }
                        offset = offset + mark + 2
                        pos = pos + UInt64(mark + 2)
                    }
                    if(offset == 0) { throw NSError(domain: "", code: 0) }
                    fd.seek(toFileOffset: pos)
                }
            } catch {
                fd.truncateFile(atOffset: pos)
            }
        }
    }
}