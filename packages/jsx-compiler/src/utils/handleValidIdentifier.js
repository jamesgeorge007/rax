/**
 * If parent expression is a.b,
 * b is an invaild identifier, because it's the value of the MemberExpression
 */
module.exports = function(identifierPath, callback) {
  switch (identifierPath.parent.type) {
    case 'ObjectProperty':
      if (identifierPath.parent.key !== identifierPath.node) {
        callback();
      }
      break;
    case 'MemberExpression':
      if (identifierPath.parent.property !== identifierPath.node) {
        callback();
      }
    default:
      callback();
  }
};
