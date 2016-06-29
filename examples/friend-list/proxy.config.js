'use strict';

const friends = [
  {
    id: 1,
    name: 'Bruce Wayne',
    username: '@Batman'
  },
  {
    id: 2,
    name: 'Clark Kent',
    username: '@Superman'
  },
  {
    id: 3,
    name: 'Maz ‘Magnus’ Eisenhardt',
    username: '@Magneto'
  },
  {
    id: 4,
    name: 'Reed Richards',
    username: '@Mister-Fantastic'
  },
  {
    id: 5,
    name: 'Charles Francis Xavier',
    username: '@ProfessorX'
  },
  {
    id: 6,
    name: 'Lex Luthor',
    username: '@LexLuthor'
  },
  {
    id: 7,
    name: 'Benjamin Grimm',
    username: '@Thing'
  },
  {
    id: 8,
    name: 'Walter Langkowski',
    username: '@Sasquatch'
  },
  {
    id: 9,
    name: 'Andrew Nolan',
    username: '@Ferro-Lad'
  },
  {
    id: 10,
    name: 'Jonathan Osterman',
    username: '@Dr.Manhattan'
  }
];

module.exports = {

  '/api/search': function (req, res) {
    setTimeout(function() {
      const query = req.query.q;
      const results = friends.filter(friend => {
        let keep = false;
        Object.keys(friend).forEach(key => {
          const val = friend[key].toString();
          if (val.toLowerCase().includes(query.toLowerCase())) {
            keep = true;
          }
        });
        return keep;
      });
      res.json({
        success: true,
        data: results,
      });
    }, 600);
  },

};

