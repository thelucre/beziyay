var assert = require("chai").assert;

const beziyay = require("../dist/index.js");

const data = [[0, 0], [10, 0], [10, 10], [0, 10]];
const expectedSVGPath =
  "M 0,0 C 2,0 8,-2 10,0 C 12,2 12,8 10,10 C 8,12 2,10 0,10";

describe("beziyay", function() {
  describe("#getSVGPath()", function() {
    it("should return SVG path with control points", function() {
      assert.equal(beziyay.getSVGPath(data), expectedSVGPath);
    });
  });

  describe("#getControlPoints()", function() {
    it("should return nested tuple arrays with correct control points", function() {
      assert.deepEqual(beziyay.getControlPoints(data), [
        [[2, 0], [8, -2]],
        [[12, 2], [12, 8]],
        [[8, 12], [2, 10]]
      ]);
    });
  });
});
