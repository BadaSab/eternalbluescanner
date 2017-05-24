(function () {
      
    const remote = require('electron').remote;

    var smb=require('./libs/smb.js')

    var net = require('net')
    var Socket = net.Socket
    var responses=[]
      
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
            currentHost.setNoDelay=true
            console.log("Connection established" + host + ":" + port)
            console.log("Sending negotiation : " + smb.negotiate_proto_request())
            currentHost.write(smb.negotiate_proto_request())
        })
        
        // Receiving data
        currentHost.on('data', function (data) {
            console.log('Received ' + (responses.length+1) + ' : ' + data);
            responses.push(data)
            switch (responses.length) {
                case 1:
                    console.log("Sending setup : " + smb.session_setup_andx_request())
                    currentHost.write(smb.session_setup_andx_request())
                    break;
                case 2:
                    var user_id=responses[1].slice(32,34)
                    console.log("Sending tree connect : " + smb.tree_connect_andx_request(host,user_id))
                    currentHost.write(smb.tree_connect_andx_request(host,user_id))
                    break;
                case 3:
                    // Send last packet
                    break;
                case 4:
                    // Get response, check if host is vulnerable
                    break;
                default:
                    break;
            }
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

        currentHost.connect(port,host)
    };

    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
    };
})();