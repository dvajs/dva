'use strict';

const qs = require('qs');
const mockjs = require('mockjs');

// 数据持久
let tableListData = {};
if (!global.tableListData) {
  const data = mockjs.mock({
    'data|100': [{
      'id|+1': 1,
      name: '@cname',
      'age|11-99': 1,
      address: '@region'
    }],
    page: {
      total: 100,
      current: 1
    }
  });
  tableListData = data;
  global.tableListData = tableListData;
} else {
  tableListData = global.tableListData;
}

module.exports = {

  'GET /api/users' (req, res) {
    const page = qs.parse(req.query);
    const pageSize = page.pageSize || 10;
    const currentPage = page.page || 1;

    let data;
    let newPage;

    let newData = tableListData.data.concat();

    if (page.field) {
      const d = newData.filter(function (item) {
        return item[page.field].indexOf(page.keyword) > -1;
      });

      data = d.slice((currentPage - 1) * pageSize, currentPage * pageSize);

      newPage = {
        current: currentPage * 1,
        total: d.length
      };
    } else {
      data = tableListData.data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
      tableListData.page.current = currentPage * 1;
      newPage = {
        current: tableListData.page.current,
        total: tableListData.page.total
      };
    }


    setTimeout(function () {
      res.json({
        success: true,
        data,
        page: newPage
      });
    }, 500);
  },

  'POST /api/users' (req, res) {
    setTimeout(function () {
      const newData = qs.parse(req.body);

      newData.id = tableListData.data.length + 1;
      tableListData.data.unshift(newData);

      tableListData.page.total = tableListData.data.length;
      tableListData.page.current = 1;

      global.tableListData = tableListData;
      res.json({
        success: true,
        data: tableListData.data,
        page: tableListData.page
      });
    }, 500);
  },

  'DELETE /api/users' (req, res) {
    setTimeout(function () {
      const deleteItem = qs.parse(req.body);

      tableListData.data = tableListData.data.filter(function (item) {
        if (item.id == deleteItem.id) {
          return false;
        }
        return true;
      });

      tableListData.page.total = tableListData.data.length;

      global.tableListData = tableListData;
      res.json({
        success: true,
        data: tableListData.data,
        page: tableListData.page
      });
    }, 500);
  },

  'PUT /api/users' (req, res) {
    setTimeout(function () {
      const editItem = qs.parse(req.body);

      tableListData.data = tableListData.data.map(function (item) {
        if (item.id == editItem.id) {
          return editItem;
        }
        return item;
      });

      global.tableListData = tableListData;
      res.json({
        success: true,
        data: tableListData.data,
        page: tableListData.page
      });
    }, 500);
  }

};
