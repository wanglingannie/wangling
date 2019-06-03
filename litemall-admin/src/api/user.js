import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/user/listMore',
    method: 'get',
    params: query
  })
}

export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

export function readUser(data) {
  return request({
    url: '/user/detail',
    method: 'get',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function listAddress(query) {
  return request({
    url: '/address/list',
    method: 'get',
    params: query
  })
}

export function listCollect(query) {
  return request({
    url: '/collect/listCollect',
    method: 'get',
    params: query
  })
}

export function listFeedback(query) {
  return request({
    url: '/feedback/listFeedback',
    method: 'get',
    params: query
  })
}

export function listFootprint(query) {
  return request({
    url: '/footprint/listFootprint',
    method: 'get',
    params: query
  })
}

export function listActivity(query) {
  return request({
    url: '/Activity/listMore',
    method: 'get',
    params: query
  })
}

export function listHistory(query) {
  return request({
    url: '/history/list',
    method: 'get',
    params: query
  })
}

export function listJoinInActivity(query) {
  return request({
    url: '/Activity/joinInActivity',
    method: 'get',
    params: query
  })
}

export function listJoinInCommonweal(query) {
  return request({
    url: '/Activity/joinInCommonweal',
    method: 'get',
    params: query
  })
}
