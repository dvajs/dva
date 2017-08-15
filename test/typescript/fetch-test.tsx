import * as fetch from '../../fetch';

fetch('', {
  headers: {},
  method: 'post',
  redirect: 'follow',
}).then(res => {
  res.type;
  res.url;
  res.body;
  res.json();
  res.headers;
  res.statusText;
});

fetch('');
