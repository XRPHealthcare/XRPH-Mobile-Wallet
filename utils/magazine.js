async function confirmMagazinePayment(data) {
  console.log('----------confirmMagazinePayment', data);
  const config = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  return await window
    .fetch(`${data?.callback_url}`, config)
    .then(async response => {
      if (response.ok) {
        const jsonData = await response.json();
        console.log('----------callback response', jsonData);
        return jsonData;
      } else {
        const jsonData = await response.json();
        console.log('----------callback response2', jsonData);
        return Promise.reject(jsonData);
      }
    });
}

async function getPaymentInfo(data) {
  const config = {
    method: 'POST',
    body: JSON.stringify({qr_id: data?.qr_id}),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  return await window
    .fetch(`${data?.verify_url}`, config)
    .then(async response => {
      if (response.ok) {
        const jsonData = await response.json();
        // console.log('----------getPaymentInfo response', jsonData);
        return jsonData;
      } else {
        const jsonData = await response.json();
        // console.log('----------getPaymentInfo response2', jsonData);
        return Promise.reject(jsonData);
      }
    });
}

export {confirmMagazinePayment, getPaymentInfo};
