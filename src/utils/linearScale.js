/**
 * from: https://codesandbox.io/s/hidden-waterfall-iw1kw?file=/src/index.js:0-739
 * @param {number} value_in_old_scale
 * @param {number} old_scale_minimum
 * @param {number} old_scale_maximum
 * @param {number} new_scale_minimum
 * @param {number} new_scale_maximum
 */
export function linearScale(
  value_in_old_scale,
  old_scale_minimum,
  old_scale_maximum,
  new_scale_minimum = 0,
  new_scale_maximum = 1
) {
  const old_scale_range = old_scale_maximum - old_scale_minimum,
    new_scale_range = new_scale_maximum - new_scale_minimum;
  var value_in_new_scale;

  value_in_new_scale =
    ((value_in_old_scale - old_scale_minimum) * new_scale_range) /
      old_scale_range +
    new_scale_minimum;
  return value_in_new_scale;
}

linearScale.to = (value, min, max) => linearScale(value, 0, 1, min, max);
