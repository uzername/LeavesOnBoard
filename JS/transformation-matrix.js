// Library for matrices and linear algebra
// SOURCE: https://github.com/chrvadala/transformation-matrix
/**
 * Calculate a point transformed with an affine matrix
 * @param matrix {Matrix} Affine Matrix
 * @param  point {Point} Point
 * @returns {Point} Point
 */
 function applyToPoint (matrix, point) {
  return Array.isArray(point)
    ? [
        matrix.a * point[0] + matrix.c * point[1] + matrix.e,
        matrix.b * point[0] + matrix.d * point[1] + matrix.f
      ]
    : {
        x: matrix.a * point.x + matrix.c * point.y + matrix.e,
        y: matrix.b * point.x + matrix.d * point.y + matrix.f
      }
}

/**
 * Calculate an array of points transformed with an affine matrix
 * @param matrix {Matrix} Affine Matrix
 * @param points {Point[]} Array of point
 * @returns {Point[]} Array of point
 */
 function applyToPoints (matrix, points) {
  return points.map(point => applyToPoint(matrix, point))
}
//import { scale } from './scale'
//import { compose } from './transform'
/**
 * Decompose a matrix into translation, scaling and rotation components, optionally
 * take horizontal and vertical flip in to consideration.
 * Note this function decomposes a matrix in rotation -> scaling -> translation order. I.e. for
 * certain translation T {tx, ty}, rotation R and scaling S { sx, sy }, it's only true for:
 *  decomposeTSR(compose(T, S, R)) === { translate: T, rotation: R, scale: S }
 * composing in a different order may yield a different decomposition result.
 * @param matrix {Matrix} Affine Matrix
 * @param  flipX {boolean} Whether the matrix contains vertical flip, i.e. mirrors on x-axis
 * @param  flipY {boolean} Whether the matrix contains horizontal flip, i.e. mirrors on y-axis
 * @returns {Transform} A transform object consisted by its translation, scaling
 * and rotation components.
 */
 function decomposeTSR (matrix, flipX = false, flipY = false) {
  // Remove flip from the matrix first - flip could be incorrectly interpreted as
  // rotations (e.g. flipX + flipY = rotate by 180 degrees).
  // Note flipX is a vertical flip, and flipY is a horizontal flip.
  if (flipX) {
    if (flipY) {
      matrix = compose(matrix, scale(-1, -1))
    } else {
      matrix = compose(matrix, scale(1, -1))
    }
  } else if (flipY) {
    matrix = compose(matrix, scale(-1, 1))
  }

  const a = matrix.a; const b = matrix.b
  const c = matrix.c; const d = matrix.d
  let scaleX, scaleY, rotation

  if (a !== 0 || c !== 0) {
    const hypotAc = Math.hypot(a, c)
    scaleX = hypotAc
    scaleY = (a * d - b * c) / hypotAc
    const acos = Math.acos(a / hypotAc)
    rotation = c > 0 ? -acos : acos
  } else if (b !== 0 || d !== 0) {
    const hypotBd = Math.hypot(b, d)
    scaleX = (a * d - b * c) / hypotBd
    scaleY = hypotBd
    const acos = Math.acos(b / hypotBd)
    rotation = Math.PI / 2 + (d > 0 ? -acos : acos)
  } else {
    scaleX = 0
    scaleY = 0
    rotation = 0
  }

  // put the flip factors back
  if (flipY) {
    scaleX = -scaleX
  }

  if (flipX) {
    scaleY = -scaleY
  }

  return {
    translate: { tx: matrix.e, ty: matrix.f },
    scale: { sx: scaleX, sy: scaleY },
    rotation: { angle: rotation }
  }
}

/**
 * Tranformation matrix that mirrors on x-axis
 * @returns {Matrix} Affine Matrix
 */
 function flipX () {
  return {
    a: 1,
    c: 0,
    e: 0,
    b: 0,
    d: -1,
    f: 0
  }
}

/**
 * Tranformation matrix that mirrors on y-axis
 * @returns {Matrix} Affine Matrix
 */
 function flipY () {
  return {
    a: -1,
    c: 0,
    e: 0,
    b: 0,
    d: 1,
    f: 0
  }
}

/**
 * Tranformation matrix that mirrors on origin
 * @returns {Matrix} Affine Matrix
 */
 function flipOrigin () {
  return {
    a: -1,
    c: 0,
    e: 0,
    b: 0,
    d: -1,
    f: 0
  }
}
//import { fromObject } from './fromObject'
//import { translate } from './translate'
//import { scale } from './scale'
//import { rotateDEG } from './rotate'
//import { skewDEG } from './skew'
//import { shear } from './shear'

/**
 * Converts array of matrix descriptor to array of matrix
 * @param definitionOrArrayOfDefinition {Object[]} Array of object describing the matrix
 * @returns {Matrix[]} Array of matrix
 *
 * @example
 * > fromDefinition([
 *  { type: 'matrix', a:1, b:2, c:3, d:4, e:5, f:6 },
 *  { type: 'translate', tx: 10, ty: 20 },
 *  { type: 'scale', sx: 2, sy: 4 },
 *  { type: 'rotate', angle: 90, cx: 50, cy: 25 },
 *  { type: 'skewX', angle: 45 },
 *  { type: 'skewY',  angle: 45 },
 *  { type: 'shear', shx: 10, shy: 20}
 * ])
 *
 * [
 *  { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
 *  { a: 1, c: 0, e: 10, b: 0, d: 1, f: 20 },
 *  { a: 2, c: 0, e: 0, b: 0, d: 4, f: 0 },
 *  { a: 6.123, c: -1, e: 0, b: 1, d: 6.123, f: 0 },
 *  { a: 1, c: 0.99.., e: 0, b: 0, d: 1, f: 0 },
 *  { a: 1, c: 0, e: 0, b: 0.99, d: 1, f: 0 },
 *  { a: 1, c: 10, e: 0, b: 20, d: 1, f: 0 }
 * ]
 **/
 function fromDefinition (definitionOrArrayOfDefinition) {
  return Array.isArray(definitionOrArrayOfDefinition)
    ? definitionOrArrayOfDefinition.map(mapper)
    : mapper(definitionOrArrayOfDefinition)

  function mapper (descriptor) {
    switch (descriptor.type) {
      case 'matrix':
        if ('a' in descriptor &&
          'b' in descriptor &&
          'c' in descriptor &&
          'd' in descriptor &&
          'e' in descriptor &&
          'f' in descriptor
        ) {
          return fromObject(descriptor)
        } else {
          throw new Error('MISSING_MANDATORY_PARAM')
        }

      case 'translate':
        if (!('tx' in descriptor)) throw new Error('MISSING_MANDATORY_PARAM')

        if ('ty' in descriptor) return translate(descriptor.tx, descriptor.ty)

        return translate(descriptor.tx)

      case 'scale':
        if (!('sx' in descriptor)) throw new Error('MISSING_MANDATORY_PARAM')

        if ('sy' in descriptor) return scale(descriptor.sx, descriptor.sy)

        return scale(descriptor.sx)

      case 'rotate':
        if (!('angle' in descriptor)) throw new Error('MISSING_MANDATORY_PARAM')

        if ('cx' in descriptor && 'cy' in descriptor) {
          return rotateDEG(descriptor.angle, descriptor.cx, descriptor.cy)
        }
        return rotateDEG(descriptor.angle)

      case 'skewX':
        if (!('angle' in descriptor)) throw new Error('MISSING_MANDATORY_PARAM')
        return skewDEG(descriptor.angle, 0)

      case 'skewY':
        if (!('angle' in descriptor)) throw new Error('MISSING_MANDATORY_PARAM')
        return skewDEG(0, descriptor.angle)

      case 'shear':
        if (!('shx' in descriptor && 'shy' in descriptor)) throw new Error('MISSING_MANDATORY_PARAM')
        return shear(descriptor.shx, descriptor.shy)

      default:
        throw new Error('UNSUPPORTED_DESCRIPTOR')
    }
  }
}
/**
 * Extract an affine matrix from an object that contains a,b,c,d,e,f keys
 * Any value could be a float or a string that contains a float
 * @param object {Object} Object that contains a,b,c,d,e,f keys
 * @return {Matrix} Affine Matrix
 */
 function fromObject (object) {
  return {
    a: parseFloat(object.a),
    b: parseFloat(object.b),
    c: parseFloat(object.c),
    d: parseFloat(object.d),
    e: parseFloat(object.e),
    f: parseFloat(object.f)
  }
}
/**
 * @ignore
 * @type {RegExp}
 */
const matrixRegex = /^matrix\(\s*([0-9_+-.e]+)\s*,\s*([0-9_+-.e]+)\s*,\s*([0-9_+-.e]+)\s*,\s*([0-9_+-.e]+)\s*,\s*([0-9_+-.e]+)\s*,\s*([0-9_+-.e]+)\s*\)$/i

/**
 * Parse a string formatted as matrix(a,b,c,d,e,f)
 * @param string {string} String with an affine matrix
 * @returns {Matrix} Affine Matrix
 *
 * @example
 * > fromString('matrix(1,2,3,4,5,6)')
 * {a: 1, b: 2, c: 3, d: 4, c: 5, e: 6}
 */
 function fromString (string) {
  const parsed = string.match(matrixRegex)
  if (parsed === null || parsed.length < 7) throw new Error(`'${string}' is not a matrix`)
  return {
    a: parseFloat(parsed[1]),
    b: parseFloat(parsed[2]),
    c: parseFloat(parsed[3]),
    d: parseFloat(parsed[4]),
    e: parseFloat(parsed[5]),
    f: parseFloat(parsed[6])
  }
}
//import { inverse } from './inverse'
//import { transform } from './transform'
//import { smoothMatrix } from './smoothMatrix'

/**
 * Returns a matrix that transforms a triangle t1 into another triangle t2, or throws an exception if it is impossible.
 * @param t1 {Point[]} Array of points containing the three points for the first triangle
 * @param t2 {Point[]} Array of points containing the three points for the second triangle
 * @returns {Matrix} Matrix which transforms t1 to t2
 * @throws Exception if the matrix becomes not invertible
 */
 function fromTriangles (t1, t2) {
  // point p = first point of the triangle
  const px1 = t1[0].x != null ? t1[0].x : t1[0][0]
  const py1 = t1[0].y != null ? t1[0].y : t1[0][1]
  const px2 = t2[0].x != null ? t2[0].x : t2[0][0]
  const py2 = t2[0].y != null ? t2[0].y : t2[0][1]

  // point q = second point of the triangle
  const qx1 = t1[1].x != null ? t1[1].x : t1[1][0]
  const qy1 = t1[1].y != null ? t1[1].y : t1[1][1]
  const qx2 = t2[1].x != null ? t2[1].x : t2[1][0]
  const qy2 = t2[1].y != null ? t2[1].y : t2[1][1]

  // point r = third point of the triangle
  const rx1 = t1[2].x != null ? t1[2].x : t1[2][0]
  const ry1 = t1[2].y != null ? t1[2].y : t1[2][1]
  const rx2 = t2[2].x != null ? t2[2].x : t2[2][0]
  const ry2 = t2[2].y != null ? t2[2].y : t2[2][1]

  const r1 = {
    a: px1 - rx1,
    b: py1 - ry1,
    c: qx1 - rx1,
    d: qy1 - ry1,
    e: rx1,
    f: ry1
  }
  const r2 = {
    a: px2 - rx2,
    b: py2 - ry2,
    c: qx2 - rx2,
    d: qy2 - ry2,
    e: rx2,
    f: ry2
  }

  const inverseR1 = inverse(r1)
  const affineMatrix = transform([r2, inverseR1])

  // round the matrix elements to smooth the finite inversion
  return smoothMatrix(affineMatrix)
}
/**
 * Identity matrix
 * @returns {Matrix} Affine Matrix
 */
 function identity () {
  return {
    a: 1,
    c: 0,
    e: 0,
    b: 0,
    d: 1,
    f: 0
  }
}
/*
export * from './applyToPoint'
export * from './fromObject'
export * from './fromString'
export * from './identity'
export * from './inverse'
export * from './isAffineMatrix'
export * from './rotate'
export * from './scale'
export * from './shear'
export * from './skew'
export * from './toString'
export * from './transform'
export * from './translate'
export * from './fromTriangles'
export * from './smoothMatrix'
export * from './fromDefinition'
export * from './fromTransformAttribute'
export * from './decompose'
export * from './flip'
*/
/**
 * Calculate a matrix that is the inverse of the provided matrix
 * @param matrix {Matrix} Affine Matrix
 * @returns {Matrix} Inverted Affine Matrix
 */
 function inverse (matrix) {
  // http://www.wolframalpha.com/input/?i=Inverse+%5B%7B%7Ba,c,e%7D,%7Bb,d,f%7D,%7B0,0,1%7D%7D%5D

  const { a, b, c, d, e, f } = matrix

  const denom = a * d - b * c

  return {
    a: d / denom,
    b: b / -denom,
    c: c / -denom,
    d: a / denom,
    e: (d * e - c * f) / -denom,
    f: (b * e - a * f) / denom
  }
}
//import { isNumeric, isObject } from './utils'

/**
 * Check if the object contain an affine matrix
 * @param object {Object} Generic Plain Object
 * @return {boolean} True if is an object and contains an affine matrix
 */

 function isAffineMatrix (object) {
  return isObject(object) &&
    'a' in object &&
    isNumeric(object.a) &&
    'b' in object &&
    isNumeric(object.b) &&
    'c' in object &&
    isNumeric(object.c) &&
    'd' in object &&
    isNumeric(object.d) &&
    'e' in object &&
    isNumeric(object.e) &&
    'f' in object &&
    isNumeric(object.f)
}
//import { isUndefined } from './utils'
//import { translate } from './translate'
//import { transform } from './transform'

const { cos, sin, PI } = Math
/**
 * Calculate a rotation matrix
 * @param angle {number} Angle in radians
 * @param [cx] {number} If (cx,cy) are supplied the rotate is about this point
 * @param [cy] {number} If (cx,cy) are supplied the rotate is about this point
 * @returns {Matrix} Affine Matrix
 */
 function rotate (angle, cx, cy) {
  const cosAngle = cos(angle)
  const sinAngle = sin(angle)
  const rotationMatrix = {
    a: cosAngle,
    c: -sinAngle,
    e: 0,
    b: sinAngle,
    d: cosAngle,
    f: 0
  }
  if (isUndefined(cx) || isUndefined(cy)) {
    return rotationMatrix
  }

  return transform([
    translate(cx, cy),
    rotationMatrix,
    translate(-cx, -cy)
  ])
}

/**
 * Calculate a rotation matrix with a DEG angle
 * @param angle {number} Angle in degree
 * @param [cx] {number} If (cx,cy) are supplied the rotate is about this point
 * @param [cy] {number} If (cx,cy) are supplied the rotate is about this point
 * @returns {Matrix} Affine Matrix
 */
 function rotateDEG (angle, cx = undefined, cy = undefined) {
  return rotate(angle * PI / 180, cx, cy)
}
//import { isUndefined } from './utils'
//import { translate } from './translate'
//import { transform } from './transform'

/**
 * Calculate a scaling matrix
 * @param sx {number} Scaling on axis x
 * @param [sy = sx] {number} Scaling on axis y (default sx)
 * @param [cx] {number} If (cx,cy) are supplied the scaling is about this point
 * @param [cy] {number} If (cx,cy) are supplied the scaling is about this point
 * @returns {Matrix} Affine Matrix
 */
 function scale (sx, sy = undefined, cx = undefined, cy = undefined) {
  if (isUndefined(sy)) sy = sx

  const scaleMatrix = {
    a: sx,
    c: 0,
    e: 0,
    b: 0,
    d: sy,
    f: 0
  }

  if (isUndefined(cx) || isUndefined(cy)) {
    return scaleMatrix
  }

  return transform([
    translate(cx, cy),
    scaleMatrix,
    translate(-cx, -cy)
  ])
}
/**
 * Calculate a shear matrix
 * @param shx {number} Shear on axis x
 * @param shy {number} Shear on axis y
 * @returns {Matrix} Affine Matrix
 */
 function shear (shx, shy) {
  return {
    a: 1,
    c: shx,
    e: 0,
    b: shy,
    d: 1,
    f: 0
  }
}
// https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skew
//const { tan } = Math

/**
 * Calculate a skew matrix
 * @param ax {number} Skew on axis x
 * @param ay {number} Skew on axis y
 * @returns {Matrix} Affine Matrix
 */
 function skew (ax, ay) {
  return {
    a: 1,
    c: Math.tan(ax),
    e: 0,
    b: Math.tan(ay),
    d: 1,
    f: 0
  }
}

/**
 * Calculate a skew matrix using DEG angles
 * @param ax {number} Skew on axis x
 * @param ay {number} Skew on axis y
 * @returns {Matrix} Affine Matrix
 */
 function skewDEG (ax, ay) {
  return skew(ax * Math.PI / 180, ay * Math.PI / 180)
}
/**
 * Rounds all elements of the given matrix using the given precision
 * @param matrix {Matrix} An affine matrix to round
 * @param [precision] {number} A precision to use for Math.round. Defaults to 10000000000 (meaning which rounds to the 10th digit after the comma).
 * @returns {Matrix} The rounded Affine Matrix
 */
 function smoothMatrix (matrix, precision = 10000000000) {
  return {
    a: Math.round(matrix.a * precision) / precision,
    b: Math.round(matrix.b * precision) / precision,
    c: Math.round(matrix.c * precision) / precision,
    d: Math.round(matrix.d * precision) / precision,
    e: Math.round(matrix.e * precision) / precision,
    f: Math.round(matrix.f * precision) / precision
  }
}
/**
 * Serialize an affine matrix to a string that can be used with CSS or SVG
 * @param matrix {Matrix} Affine Matrix
 * @returns {string} String that contains an affine matrix formatted as matrix(a,b,c,d,e,f)
 */
 function toCSS (matrix) {
  return toString(matrix)
}

/**
 * Serialize an affine matrix to a string that can be used with CSS or SVG
 * @param matrix {Matrix} Affine Matrix
 * @returns {string} String that contains an affine matrix formatted as matrix(a,b,c,d,e,f)
 */
 function toSVG (matrix) {
  return toString(matrix)
}

/**
 * Serialize an affine matrix to a string that can be used with CSS or SVG
 * @param matrix {Matrix} Affine Matrix
 * @returns {string} String that contains an affine matrix formatted as matrix(a,b,c,d,e,f)
 */
 function toString (matrix) {
  return `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.e},${matrix.f})`
}
/**
 * Merge multiple matrices into one
 * @param matrices {...Matrix | Matrix[]} Matrices listed as separate parameters or in an array
 * @returns {Matrix} Affine Matrix
 */
 function transform (...matrices) {
  matrices = Array.isArray(matrices[0]) ? matrices[0] : matrices

  const multiply = (m1, m2) => {
    return {
      a: m1.a * m2.a + m1.c * m2.b,
      c: m1.a * m2.c + m1.c * m2.d,
      e: m1.a * m2.e + m1.c * m2.f + m1.e,
      b: m1.b * m2.a + m1.d * m2.b,
      d: m1.b * m2.c + m1.d * m2.d,
      f: m1.b * m2.e + m1.d * m2.f + m1.f
    }
  }

  switch (matrices.length) {
    case 0:
      throw new Error('no matrices provided')

    case 1:
      return matrices[0]

    case 2:
      return multiply(matrices[0], matrices[1])

    default: {
      const [m1, m2, ...rest] = matrices
      const m = multiply(m1, m2)
      return transform(m, ...rest)
    }
  }
}

/**
 * Merge multiple matrices into one
 * @param matrices {...Matrix | Matrix[]} Matrices listed as separate parameters or in an array
 * @returns {Matrix} Affine Matrix
 */
 function compose (...matrices) {
  return transform(...matrices)
}
/**
 * Calculate a translate matrix
 * @param tx {number} Translation on axis x
 * @param [ty = 0] {number} Translation on axis y
 * @returns {Matrix} Affine Matrix
 */
 function translate (tx, ty = 0) {
  return {
    a: 1,
    c: 0,
    e: tx,
    b: 0,
    d: 1,
    f: ty
  }
}
 function isUndefined (val) {
  return typeof val === 'undefined'
}

 function isNumeric (n) {
  return typeof n === 'number' &&
    !Number.isNaN(n) &&
    Number.isFinite(n)
}

 function isObject (obj) {
  return typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj)
}

 function matchesShape (obj, keys) {
  return keys.every(key => key in obj)
}