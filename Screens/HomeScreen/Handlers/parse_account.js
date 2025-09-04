export const parseAccount = data => {
  let response;
  do {
    response = JSON.parse(data);
    data = response;
  } while (typeof response === 'string');
  return data;
};
