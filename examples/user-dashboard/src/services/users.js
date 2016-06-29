// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
import xFetch from './xFetch';
import qs from 'qs';

export async function query(params) {
  return xFetch(`/api/users?${qs.stringify(params)}`);
}

export async function create(params) {
  return xFetch('/api/users', {
    method: 'post',
    body: qs.stringify(params),
  });
}

export async function remove(params) {
  return xFetch('/api/users', {
    method: 'delete',
    body: qs.stringify(params),
  });
}

export async function update(params) {
  return xFetch('/api/users', {
    method: 'put',
    body: qs.stringify(params),
  });
}
