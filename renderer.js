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

      var scanWindow
      var resTable = document.getElementById("resTable")
      
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
          const windowID = BrowserWindow.getFocusedWindow().id
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

      ipcRenderer.on('host-scanned', function (event, host, vulnerable, hostOS) {
        var row = resTable.insertRow()
        var cHost = row.insertCell(0)
        var cVulnerable = row.insertCell(1)
        var cHostOS = row.insertCell(2)
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

