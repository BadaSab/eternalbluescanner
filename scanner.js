(function () {
      
    const remote = require('electron').remote;
    const ipc = require('electron').ipcRenderer
    const BrowserWindow = require('electron').remote.BrowserWindow

    var smb=require('./libs/smb.js')
    var Scan=require('./model/scan.js')
    var net = require('net')
    var Socket = net.Socket
    var scanResults

    var fromWindow
      
    function init() { }

    ipc.on('scan-range', function (event, iniIP, endIP, fromWindowId) {
      fromWindow = BrowserWindow.fromId(fromWindowId)
      scanResults = new Scan(iniIP,endIP)
      var iniIPArray=iniIP.split(".")
      var endIPArray=endIP.split(".")
      var first = iniIPArray[0]*0x1000000 + iniIPArray[1]*0x10000 + iniIPArray[2]*0x100 + iniIPArray[3]*1
      var last = endIPArray[0]*0x1000000 + endIPArray[1]*0x10000 + endIPArray[2]*0x100 + endIPArray[3]*1
      for (var index = first; index < last; index++) {
        var oc4 = (index>>24) & 0xff;
        var oc3 = (index>>16) & 0xff;
        var oc2 = (index>>8) & 0xff;
        var oc1 = index & 0xff;
        var host = oc4 + "." + oc3 + "." + oc2 + "." + oc1
        scan(host)
      }
      //window.close()
    })
    
    function scan(host) { 
        var currentHost = new Socket({
            allowHalfOpen:true
        })
        var status = null
        var error = null
        var timeout = 10000
        var port = 445
        var hostOS
        var responses=[]

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
                    var user_id=new Buffer([responses[1][32],responses[1][33]])//responses[1].slice(32,34)
                    var host_id=responses[1].slice(45,responses[1].length)
                    hostOS=host_id.toString('utf8')
                    console.log("Sending tree connect : " + smb.tree_connect_andx_request(host,user_id))
                    currentHost.write(smb.tree_connect_andx_request(host,user_id))
                    break;
                case 3:
		            var tree_id=responses[2].slice(28,30)
		            var process_id=responses[2].slice(30,32)
	            	var user_id=responses[2].slice(32,34)
	            	var multiplex_id=responses[2].slice(34,36)
                    console.log("Sending peeknamedpipe : " + smb.peeknamedpipe_request(tree_id,process_id,user_id,multiplex_id))
                    currentHost.write(smb.peeknamedpipe_request(tree_id,process_id,user_id,multiplex_id))                    
                    break;
                case 4:
                    var status=responses[3].slice(9,13)
                    var vulnerable = new Buffer([0x05,0x02,0x00,0xC0])
                    var isVulnerable = status.equals(vulnerable)
                    scanResults.addScan(host, isVulnerable, hostOS)
                    alert(scanResults.getIPRange())
                    fromWindow.webContents.send('host-scanned', host, isVulnerable, hostOS)
                    fromWindow.webContents.send('scan-updated', scanResults)
                    currentHost.destroy()
                    break;
                default:
                    break;
            }
        })

        // If no response, assume port is not listening
        currentHost.setTimeout(timeout)
        currentHost.on('timeout', function () {
            status = 'closed'
            //console.log("Received data : " + currentHost.bytesRead)
            //console.log('Timeout (' + timeout + 'ms) occurred waiting for ' + host + ':' + port + ' to be available')
            if (responses.length>0) {
                fromWindow.webContents.send('host-scanned', host, "error", hostOS)
            }
            currentHost.destroy()
        })

        // Assuming the port is not open if an error. May need to refine based on
        // exception
        currentHost.on('error', function (exception) {
            console.log("error: " + exception.code)
            //fromWindow.webContents.send('host-scanned', host, exception.code, hostOS)
            if (exception.code !== 'ECONNREFUSED') {
            error = exception
            } else {
            connectionRefused = true
            }
            status = 'closed'
            currentHost.destroy()
        })

        currentHost.connect(port,host)
    };

    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
    };
})();