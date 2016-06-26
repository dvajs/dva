'use strict';

module.exports = {

  '/api/products': function (req, res) {
    setTimeout(function() {
      res.json({
        success: true,
        data: [
          {
            id: 1,
            title: 'ant-tool',
            description: 'New generation tool for alipay.',
            vote: 65,
            thumb_url: 'https://zos.alipayobjects.com/rmsportal/lKTHqeueZIDAoKd.png',
            submitter: '云谦',
          },
          {
            id: 2,
            title: 'roof',
            description: 'Roof 是一款基于 React 的应用框架。',
            vote: 35,
            thumb_url: 'https://zos.alipayobjects.com/rmsportal/IGmuncbXdWozPNe.png',
            submitter: '加缪',
          },
        ],
      });
    }, 600);
  },

  '/api/products/vote': function(req, res) {
    setTimeout(function() {
      res.end({success:true});
    }, 600);
  },

};

