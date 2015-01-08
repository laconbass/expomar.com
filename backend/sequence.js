/**
 * @dependencies
 */

var isFn = function( o ){ return 'function' === typeof o; };


/**
 * @function sequence: Execute complete after sequentially executing step once
 * for each item in iterable. Optionally specify context for those functions.
 *
 * @param iterable (object or array): Any iterable object (for..in)
 * @param step (function): executed for each item in sequence.
 * The step function receives the following params:
 *   - key (mixed): key in iterable for the current step
 *   - val (mixed): value in iterable for the current step
 *   - next (function): calls the next step in the sequence
 * @param complete (function): The last step in the sequence
 * @param context (object): Optional. Step's and complete's context
 */

var exports = module.exports = sequence;

exports.version = '1';
exports.stability = 2;

function sequence(iterable, step, complete, context) {
  if( !isFn(step) || !isFn(complete) ){
    throw TypeError("please provide step and complete callbacks as functions");
  }
  var sequence = [], context = context || null;

  // push steps on sequence
  for( var key in iterable ) {
    sequence.push( step.bind( context, key, iterable[key], next) );
  }
  // start sequence
  process.nextTick( sequence[0] );

  // "next" function for steps
  function next(err){
    // remove completed step
    sequence.shift();
    // force complete if error
    if( err && err instanceof Error ){
      sequence.length = 0;
    } else if( err ){
      err = TypeError("sequence#next received non-error as error: "+err);
    }
    // continue or complete
    sequence.length? sequence[0]() : complete.call( context, err || null );
  }
};
