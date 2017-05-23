
exports.negotiate_proto_request = function () {
            return new Buffer([
                0x00,0x00,0x00,0x54,
                0xFF,0x53,0x4D,0x42,0x72,0x00,0x00,0x00,0x00,0x18,
                0x01,0x28,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                0x00,0x00,0x00,0x00,0x00,0x00,0x2F,0x4B,0x00,0x00,
                0xC5,0x5E,0x00,0x31,0x00,0x02,0x4C,0x41,0x4E,0x4D,
                0x41,0x4E,0x31,0x2E,0x30,0x00,0x02,0x4C,0x4D,0x31,
                0x2E,0x32,0x58,0x30,0x30,0x32,0x00,0x02,0x4E,0x54,
                0x20,0x4C,0x41,0x4E,0x4D,0x41,0x4E,0x20,0x31,0x2E,
                0x30,0x00,0x02,0x4E,0x54,0x20,0x4C,0x4D,0x20,0x30,
                0x2E,0x31,0x32,0x00
            ])
};

exports.session_setup_andx_request = function() {
            return new Buffer([
                0x00,0x00,0x00,0x63,
                0xFF,0x53,0x4D,0x42,0x73,0x00,0x00,0x00,0x00,0x18,
                0x01,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                0x00,0x00,0x00,0x00,0x00,0x00,0x2F,0x4B,0x00,0x00,
                0xC5,0x5E,0x0D,0xFF,0x00,0x00,0x00,0xDF,0xFF,0x02,
                0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                0x00,0x00,0x00,0x00,0x00,0x40,0x00,0x00,0x00,0x26,
                0x00,0x00,0x2e,0x00,0x57,0x69,0x6e,0x64,0x6f,0x77,
                0x73,0x20,0x32,0x30,0x30,0x30,0x20,0x32,0x31,0x39,
                0x35,0x00,0x57,0x69,0x6e,0x64,0x6f,0x77,0x73,0x20,
                0x32,0x30,0x30,0x30,0x20,0x35,0x2e,0x30,0x00
            ])
}

exports.tree_connect_andx_request = function(ip, userid) {
    var ipc = Buffer.from(utf8_encode("\\\\" + ip + "\\IPC$"),'utf8')
    console.log("IP: " + ip + " | IPC : "+ ipc + " | hex : " + ipc.toString('hex'))
    var data = new Buffer([
        0x00,0x00,0x00,0x47,
        0xFF,0x53,0x4D,0x42,0x75,0x00,0x00,0x00,0x00,0x18,
        0x01,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x2F,0x4B,userid,0xC5,0x5E,
        0x04,0xFF,0x00,0x00,0x00,0x00,0x00,0x01,0x00,0x1A,
        0x00,0x00,ipc.toString('binary'),0x00,0x3f,0x3f,0x3f,0x3f,0x3f,0x00
    ])
    var length=data.byteLength
    var bufflength=data.slice(3,3)
    bufflength=length;
    console.log("Buffer ready: " + data)
    return data;
}

function utf8_encode(s) {
  return unescape(encodeURIComponent(s));
}