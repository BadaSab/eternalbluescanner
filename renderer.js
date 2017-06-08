// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
(
    function () {
      
      const remote = require('electron').remote;
      const BrowserWindow = require('electron').remote.BrowserWindow
      const ipcRenderer = require('electron').ipcRenderer
      const url = require('url')
      const path = require('path')
      var dns = require('dns');
      var Scan=require('./model/scan.js')

      var scanWindow
      var resTable = document.getElementById("resTable")
      var resTableBody = document.getElementById("results")
      
      /// init
      function init() { 
        // Close button
        document.getElementById("btnClose").addEventListener("click", function (e) {
          if (scanWindow!=null) {
            scanWindow.close()
            scanWindow=null
          }
          const window = remote.getCurrentWindow();
          window.close();
        });

        // Play button
        document.getElementById("btnPlay").addEventListener("click", function (e) {
            // Validate IPs
            var iniIP=document.getElementById("iniIP").value;
            var endIP=document.getElementById("endIP").value;
            //var launchScan = remote.require('./main').launchScan;
            if (ValidateIP(iniIP) && ValidateIP(endIP)) {
                launchScan(iniIP,endIP);
            } else {
              alert("Invalid IP range")
            }
        });        
      }

      function ValidateIP(IP) {
        var regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return regex.test(IP);
      }

      function launchScan(iniIP,endIP) {
        scanWindow = new BrowserWindow({width: 400, height: 225, show:false})
        scanWindow.loadURL(url.format({
          pathname: path.join(__dirname, 'scan.html'),
          protocol: 'file:',
          slashes: true
        }))

        scanWindow.webContents.on('did-finish-load', function () {
          //const windowID = BrowserWindow.getFocusedWindow().id
          const windowID = remote.getCurrentWindow().id
          scanWindow.webContents.send('scan-range', iniIP, endIP, windowID)
        })

        // Open the DevTools.
        //scanWindow.webContents.openDevTools()
        // Emitted when the window is closed.
        scanWindow.on('closed', function () {
          // Dereference the window object, usually you would store windows
          // in an array if your app supports multi windows, this is the time
          // when you should delete the corresponding element.
          scanWindow = null
        })
      }

      function reverseLookup(ip) {
        dns.reverse(ip,function(err,domains){
          if(err!=null)	callback(err);

          domains.forEach(function(domain){
            dns.lookup(domain,function(err, address, family){
                  for (var i = 2, row; row = resTable.rows[i]; i++) {
                    //iterate through rows
                    if (row.cells[0].innerHTML==address) {
                      row.cells[1].innerHTML=domain
                    }
                  }
            });
          });
        });
      }

    function compareIP( a, b )
    {
        var aa = a.split(".");
        var bb = b.split(".");
        
        return ( aa[0]*0x1000000 + aa[1]*0x10000 + aa[2]*0x100 + aa[3]*1 )
             - ( bb[0]*0x1000000 + bb[1]*0x10000 + bb[2]*0x100 + bb[3]*1 );
    }

    ipcRenderer.on('scan-updated', function (event, scanResults) {
        alert(scanResults.getIPRange)
    })

    ipcRenderer.on('host-scanned', function (event, host, vulnerable, hostOS) {
        reverseLookup(host)
        var newRow
        if (resTable.rows.length>2) {
          for (var i = 2, row; row = resTable.rows[i]; i++) {
            //iterate through rows
            if (compareIP(row.cells[0].innerHTML,host)>0) {
              break;
            }
          }
          newRow = resTable.insertRow(i)
        } else {
          newRow = resTable.insertRow()
        }
        var cHost = newRow.insertCell(0)
        var cHostDNS = newRow.insertCell(1)
        var cVulnerable = newRow.insertCell(2)
        var cHostOS = newRow.insertCell(3)
        cHost.innerHTML=host
        cVulnerable.innerHTML=vulnerable
        cHostOS.innerHTML=hostOS
      })
      
      document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
      };
    }  
)();

