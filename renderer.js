// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
(
    function () {
      
      const remote = require('electron').remote; 
      
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
            var launchScan = remote.require('./main').launchScan;
            if (ValidateIP(iniIP) && ValidateIP(endIP)) {
                launchScan();
            }
        });        
      }

      function ValidateIP(IP) {
        //var regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        //return regex.test(IP);
        return true;
      }
      
      document.onreadystatechange = function () {
        if (document.readyState == "complete") {
          init(); 
        }
      };
    }
    )();