/**
 * Created by antonio_dimariano on 12/05/2017.
 */


module.exports = {
  compareObjectSchema: function(objectA,objectB) {
    let aKey = Object.keys(objectA).sort()
    let bKey = Object.keys(objectA).sort()
    return (JSON.stringify(aKey) === JSON.stringify(bKey))
  }



}
