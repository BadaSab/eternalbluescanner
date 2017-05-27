// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
(
    function () {
      
      const remote = require('electron').remote;
      const BrowserWindow = require('electron').remote.BrowserWindow
      const url = require('url')
      const path = require('path')
      
      /// init
      function init() { 
        // Close button
        document.getElementById("btnClose").addEventListener("click", function (e) {
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
            }
        });        
      }

      function ValidateIP(IP) {
        //var regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        //return regex.test(IP);
        return true;
      }

      function launchScan(iniIP,endIP) {
        var scanWindow = new BrowserWindow({width: 400, height: 225, show:false})
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
        scanWindow.webContents.openDevTools()
        // Emitted when the window is closed.
        scanWindow.on('closed', function () {
          // Dereference the window object, usually you would store windows
          // in an array if your app supports multi windows, this is the time
          // when you should delete the corresponding element.
          scanWindow = null
        })
      }
      
      document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
      };
    }  
)();

