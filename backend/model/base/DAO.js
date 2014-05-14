

var DAO = {
  create: function( schema, connection, input, callback ){
    throw new Error( 'DAO#create should be overriden by implementations' );
  },
  read: function( schema, connection, pk, callback ){
    throw new Error( 'DAO#read should be overriden by implementations' );
  },
  update: function( schema, connection, input, callback ){
    throw new Error( 'DAO#update should be overriden by implementations' );
  },
  destroy: function( schema, connection, pk, callback ){
    throw new Error( 'DAO#destroy should be overriden by implementations' );
  }
};

module.exports = DAO;
