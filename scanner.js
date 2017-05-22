(function () {
      
    const remote = require('electron').remote;

    var net = require('net')
    var Socket = net.Socket
      
    function init() { 
        var currentHost = new Socket({
            allowHalfOpen:true
        })
        var status = null
        var error = null
        var timeout = 100000
        var host = "192.168.56.101"
        var port = 445

        // Socket connection established, port is open
        currentHost.on('connect', function () {
            status = 'open'
            currentHost.setNoDelay=true;
            currentHost.setEncoding('hex')
            var buff = new Buffer([
                0x00,0x00,0x00,0x49,
                0xFF,0x53,0x4D,0x42,0x72,0x00,0x00,0x00,0x00,0x18,
                0x01,0x28,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
                0x00,0x00,0x00,0x00,0x00,0x00,0x2F,0x4B,0x00,0x00,
                0xC5,0x5E,0x00,0x31,0x00,0x02,0x4C,0x41,0x4E,0x4D,
                0x41,0x4E,0x31,0x2E,0x30,0x00,0x02,0x4E,0x54,0x20,
                0x4C,0x41,0x4E,0x4D,0x41,0x4E,0x20,0x31,0x2E,0x30,
                0x00,0x02,0x4E,0x54,0x20,0x4C,0x4D,0x20,0x30,0x2E,
                0x31,0x32,0x00
            ])
            console.log("Connection established" + host + ":" + port)
            console.log("Sending negotiation : " + buff)
            currentHost.write(buff,function() {
                        var setup = new Buffer([
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
                console.log("Sent data : " + currentHost.bytesWritten)
                var lol=currentHost.read()
            })
            
        })
        

        // Receiving data
        currentHost.on('data', function (data) {
            console.log('Received: ' + data);
            var setup = new Buffer([
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
            console.log("Setting up : " + setup)
            currentHost.write(setup,function() {
                console.log("Received data : " + currentHost.bytesRead)
            })
        })

        // If no response, assume port is not listening
        currentHost.setTimeout(timeout)
        currentHost.on('timeout', function () {
            status = 'closed'
            console.log("Received data : " + currentHost.bytesRead)
            console.log('Timeout (' + timeout + 'ms) occurred waiting for ' + host + ':' + port + ' to be available')
            currentHost.destroy()
        })

        // Assuming the port is not open if an error. May need to refine based on
        // exception
        currentHost.on('error', function (exception) {
            console.log("error: " + exception.code)
            if (exception.code !== 'ECONNREFUSED') {
            error = exception
            } else {
            connectionRefused = true
            }
            status = 'closed'
        })

/*
        var s=net.connect(port,host,function() {
            console.log('connected');
        })
        s.on('data', function (data) {
            alert(data);
        })
        s.write(negotiate_proto_request(),function() {alert('sent!')})
        */
        currentHost.connect(port,host)
    };

    function checkEternalBlue(socket) {
        socket.write(negotiate_proto_request())

    }

    function negotiate_proto_request() {
        var netbios = [
            '\x00',              // 'Message_Type'
            '\x00\x00\x54'       // 'Length'
        ]
        var smb_header = [
            '\xFF\x53\x4D\x42',  // 'server_component': .SMB
            '\x72',              // 'smb_command': Negotiate Protocol
            '\x00\x00\x00\x00',  // 'nt_status'
            '\x18',              // 'flags'
            '\x01\x28',          // 'flags2'
            '\x00\x00',          // 'process_id_high'
            '\x00\x00\x00\x00\x00\x00\x00\x00',  // 'signature'
            '\x00\x00',          // 'reserved'
            '\x00\x00',          // 'tree_id'
            '\x2F\x4B',          // 'process_id'
            '\x00\x00',          // 'user_id'
            '\xC5\x5E'           // 'multiplex_id'
        ]
        var negotiate_proto_request = [
            '\x00',              // 'word_count'
            '\x31\x00',          // 'byte_count'

            // Requested Dialects
            '\x02',              // 'dialet_buffer_format'
            '\x4C\x41\x4E\x4D\x41\x4E\x31\x2E\x30\x00',   // 'dialet_name': LANMAN1.0

            '\x02',              // 'dialet_buffer_format'
            '\x4C\x4D\x31\x2E\x32\x58\x30\x30\x32\x00',   // 'dialet_name': LM1.2X002

            '\x02',              // 'dialet_buffer_format'
            '\x4E\x54\x20\x4C\x41\x4E\x4D\x41\x4E\x20\x31\x2E\x30\x00',  // 'dialet_name3': NT LANMAN 1.0

            '\x02',              // 'dialet_buffer_format'
            '\x4E\x54\x20\x4C\x4D\x20\x30\x2E\x31\x32\x00'   // 'dialet_name4': NT LM 0.12
        ]
        var request = [netbios,smb_header,negotiate_proto_request]
        return request.join();
    }

    function session_setup_andx_request() { 
            netbios = [
                '\x00',              // 'Message_Type'
                '\x00\x00\x63'       // 'Length'
                ]

                smb_header = [
                '\xFF\x53\x4D\x42',  // 'server_component': .SMB
                '\x73',              // 'smb_command': Session Setup AndX
                '\x00\x00\x00\x00',  // 'nt_status'
                '\x18',              // 'flags'
                '\x01\x20',          // 'flags2'
                '\x00\x00',          // 'process_id_high'
                '\x00\x00\x00\x00\x00\x00\x00\x00',  // 'signature'
                '\x00\x00',          // 'reserved'
                '\x00\x00',          // 'tree_id'
                '\x2F\x4B',          // 'process_id'
                '\x00\x00',          // 'user_id'
                '\xC5\x5E'           // 'multiplex_id'
                ]

                session_setup_andx_request = [
                '\x0D',              // Word Count
                '\xFF',              // AndXCommand: No further command
                '\x00',              // Reserved
                '\x00\x00',          // AndXOffset
                '\xDF\xFF',          // Max Buffer
                '\x02\x00',          // Max Mpx Count
                '\x01\x00',          // VC Number
                '\x00\x00\x00\x00',  // Session Key
                '\x00\x00',          // ANSI Password Length
                '\x00\x00',          // Unicode Password Length
                '\x00\x00\x00\x00',  // Reserved
                '\x40\x00\x00\x00',  // Capabilities
                '\x26\x00',          // Byte Count
                '\x00',              // Account
                '\x2e\x00',          // Primary Domain
                '\x57\x69\x6e\x64\x6f\x77\x73\x20\x32\x30\x30\x30\x20\x32\x31\x39\x35\x00',    // Native OS: Windows 2000 2195
                '\x57\x69\x6e\x64\x6f\x77\x73\x20\x32\x30\x30\x30\x20\x35\x2e\x30\x00',        // Native OS: Windows 2000 5.0
                ]
        var request = [netbios,smb_header,session_setup_andx_request]
        return request.join();
    }
      
      document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
      };
})();