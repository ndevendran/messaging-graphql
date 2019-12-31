export default function MakeQuerablePromise(promise, helper) {
  if(promise.isResolved) return promise;

  var isPending = true;
  var isRejected = false;
  var isFulfilled = false;

  var result = promise.then(
    function(v) {
      isFulfilled = true;
      isPending = false;
      return helper(v)
    },
    function(e) {
      isRejected = true;
      isPending = false;
      throw e;
    }
  );

  result.isFulfilled = function() { return isFulfilled; };
  result.isPending = function() { return isPending; };
  result.isRejected = function() { return isRejected; };
  return result;
};

export function waitForPromise (myPromise) {
  if(!myPromise.isFulfilled) {
    console.log("Waiting for promise...")
    setTimeout(waitForPromise, 1000/60);
  }
};
