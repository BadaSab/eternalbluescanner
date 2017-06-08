
class Scan {

    constructor(iniIP,endIP) {
        this.initialIP=iniIP
        this.finalIP=endIP
        this.hosts=[]
    }

    addScan(host,vulnerable,OS) {
        var hostResults = {host:host, vulnerable:vulnerable, OS:OS};
        this.hosts.push(hostResults)
    }

    static gettIPRange() {
        return this.initialIP + " - " + this.finalIP
    }

    getResults() {
        return this.hosts;
    }

    count() {
        return this.hosts.length
    }
}

module.exports = Scan 