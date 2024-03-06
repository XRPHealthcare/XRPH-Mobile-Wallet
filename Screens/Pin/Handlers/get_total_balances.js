const getTotalBalances = async (accounts) => {
    console.log(accounts)
    // take in array of balances and return object of balances in each currency
    // currencies: ["USD", "EUR", "GBP"]
    let updatedAccounts = [];
    for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {

        console.log('balancing')
        let allBalances = {
            USD: "0",
            EUR: "0",
            GBP: "0",
        };
        const currencies = ["USD", "EUR", "GBP"];
        const balances = accounts[accountIndex].balances;
        
        if (balances.length === 0) {
            updatedAccounts.push({
                ...accounts[accountIndex],
                totalBalances: allBalances
            })
        } else {
            
            for (let i = 0; i < currencies.length; i++) {
                let sum = 0;
                for (let j= 0; j < balances.length; j++) {
                    // balances[i].currency
                    // balances[i].value
                    const { currency, value } = balances[j];
                    // const value = Number(valueStr);
                    
                    const response = await fetch("https://api.livecoinwatch.com/coins/single", {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'X-Api-Key': '********************************'
                        },
                        body: JSON.stringify({
                            currency: currencies[i],
                            code: currency,
                            meta: true
                        })
                    });
                    const tokenJson = await response.json();
                    const tokenRate = tokenJson.rate;
                    const amount = Number(value * tokenRate);
                    sum += amount;
                }
                sum = sum.toFixed(2);
                allBalances[currencies[i]] = String(sum.toLocaleString("en-US"));
            }

            updatedAccounts.push({
                ...accounts[accountIndex],
                totalBalances: allBalances
            })
        }
    }
    console.log(updatedAccounts)

    return updatedAccounts;
}



export default getTotalBalances;