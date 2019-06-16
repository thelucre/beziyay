const defaults = {};

/**
 * data - An array of tuples
 */
export function getSVGPath(data, options = {}) {
  let opts = Object.assign({}, defaults, options);
  return svgPath(data, bezierCommand, opts);
}

/**
 * data - An array of tuples
 */
export function getControlPoints(data) {
  return makeControlPoints(data);
}

export default {
  getSVGPath,
  getControlPoints
};

const makeControlPoints = (points, options) => {
  return points
    .map((point, i) => {
      if (i === 0) return null;
      let cps = bezierCommand(point, i, points);
      return [[cps.cpsX, cps.cpsY], [cps.cpeX, cps.cpeY]];
    })
    .filter(value => !!value);
};

// Properties of a line
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: l, angle: a }: properties of the line
function line(pointA, pointB) {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
}

// Position of a control point
// I:  - current (array) [x, y]: current point coordinates
//     - previous (array) [x, y]: previous point coordinates
//     - next (array) [x, y]: next point coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: a tuple of coordinates
function controlPoint(current, previous, next, reverse) {
  // When 'current' is the first or last point of the array
  // 'previous' or 'next' don't exist.
  // Replace with 'current'
  const p = previous || current;
  const n = next || current;
  // The smoothing ratio
  const smoothing = 0.2;
  // Properties of the opposed-line
  const o = line(p, n);
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  // The control point position is relative to the current point
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
}

// Create the bezier curve command
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
function bezierCommand(point, i, a) {
  let prev = a[i - 1];
  let prevprev = a[i - 2];
  let next = a[i + 1];

  // start control point
  const [cpsX, cpsY] = controlPoint(prev, prevprev, point);
  // end control point
  const [cpeX, cpeY] = controlPoint(point, prev, next, true);
  return {
    cpsX,
    cpsY,
    cpeX,
    cpeY,
    point
  };
}

function writeSVGControlPoint(d) {
  return `C ${d.cpsX},${d.cpsY} ${d.cpeX},${d.cpeY} ${d.point[0]},${
    d.point[1]
  }`;
}

// Render the svg <path> element
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) a svg path command
// O:  - (string): a Svg <path> element
function svgPath(points, command, opts) {
  // build the d attributes by looping over the points
  let d = points.reduce(
    (acc, point, i, a) =>
      i === 0
        ? // if first point
          `M ${point[0]},${point[1]}`
        : // else
          `${acc} ${writeSVGControlPoint(command(point, i, a))}`,
    ""
  );
  return d;
}

function round(num, decimals) {
  return parseInt(num.toFixed(decimals), 10);
}
