const xrpl = require('xrpl');

const checkConnectionStatus = async () => {
    try {
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233/");
        await client.connect();
        client.disconnect();
        return true;
    } catch (e) {
        console.log(e.message);
        return false;
    }
}

export default checkConnectionStatus;