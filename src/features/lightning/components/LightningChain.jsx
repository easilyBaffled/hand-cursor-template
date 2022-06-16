import './style.css';
import { Vector2 } from 'three';
import { useElement } from '../../../hooks/useElement';
import SimplexNoise from 'simplex-noise';

/**
 * requestAnimationFrame
 */
window.requestAnimationFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

class Point extends Vector2 {
  constructor(x, y, radius) {
    super(x, y);

    this.radius = radius || 7;

    this.vec = new Vector2(random(1, -1), random(1, -1)).normalize();
    this._easeRadius = this.radius;
    this._currentRadius = this.radius;
  }

  color = 'rgb(255, 255, 255)';
  dragging = false;
  _latestDrag = null;

  update(points, bounds) {
    this._currentRadius = random(this._easeRadius, this._easeRadius * 0.35);
    this._easeRadius += (this.radius - this._easeRadius) * 0.1;

    if (this.dragging) return;

    var vec = this.vec,
      i,
      len,
      p,
      d;

    for (i = 0, len = points.length; i < len; i++) {
      p = points[i];
      if (p !== this) {
        d = this.distanceToSquared(p);
        if (d < 90000) {
          vec.add(this.sub(p).normalize().multiplyScalar(0.03));
        } else if (d > 250000) {
          vec.add(p.sub(this).normalize().multiplyScalar(0.015));
        }
      }
    }

    if (vec.length() > 3) vec.normalize().multiplyScalar(3);

    this.add(vec);

    if (this.x < bounds.x) {
      this.x = bounds.x;
      if (vec.x < 0) vec.x *= -1;
    } else if (this.x > bounds.right) {
      this.x = bounds.right;
      if (vec.x > 0) vec.x *= -1;
    }

    if (this.y < bounds.y) {
      this.y = bounds.y;
      if (vec.y < 0) vec.y *= -1;
    } else if (this.y > bounds.bottom) {
      this.y = bounds.bottom;
      if (vec.y > 0) vec.y *= -1;
    }
  }

  hitTest(p) {
    if (this.distanceToSquared(p) < 900) {
      this._easeRadius = this.radius * 2.5;
      return true;
    }
    return false;
  }

  startDrag() {
    this.dragging = true;
    this.vec.set(0, 0);
    this._latestDrag = new Vector2().set(this);
  }

  drag(p) {
    this._latestDrag.set(this);
    this.set(p);
  }

  endDrag() {
    this.vec = this.sub(this._latestDrag);
    this.vec.set(0, 0);
    this.dragging = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this._currentRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this._currentRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Lightning
 */
function Lightning(startPoint, endPoint, step) {
  this.startPoint = startPoint || new Vector2();
  this.endPoint = endPoint || new Vector2();
  this.step = step || 45;

  this.children = [];
}

Lightning.prototype = {
  color: 'rgba(255, 255, 255, 1)',
  speed: 0.025,
  amplitude: 1,
  lineWidth: 5,
  blur: 50,
  blurColor: 'rgba(255, 255, 255, 0.5)',
  points: null,
  off: 0,
  _simplexNoise: new SimplexNoise(),
  // Case by child
  parent: null,
  startStep: 0,
  endStep: 0,

  length: function () {
    return this.startPoint.distanceTo(this.endPoint);
  },

  getChildNum: function () {
    return children.length;
  },

  setChildNum: function (num) {
    var children = this.children,
      child,
      i,
      len;

    len = this.children.length;

    if (len > num) {
      for (i = num; i < len; i++) {
        children[i].dispose();
      }
      children.splice(num, len - num);
    } else {
      for (i = len; i < num; i++) {
        child = new Lightning();
        child._setAsChild(this);
        children.push(child);
      }
    }
  },

  update: function () {
    var startPoint = this.startPoint,
      endPoint = this.endPoint,
      length,
      normal,
      radian,
      sinv,
      cosv,
      points,
      off,
      waveWidth,
      n,
      av,
      ax,
      ay,
      bv,
      bx,
      by,
      m,
      x,
      y,
      children,
      child,
      i,
      len;

    if (this.parent) {
      if (this.endStep > this.parent.step) {
        this._updateStepsByParent();
      }

      startPoint.set(this.parent.points[this.startStep]);
      endPoint.set(this.parent.points[this.endStep]);
    }

    length = this.length();
    normal = endPoint
      .sub(startPoint)
      .normalize()
      .multiplyScalar(length / this.step);
    radian = normal.angle();
    sinv = Math.sin(radian);
    cosv = Math.cos(radian);

    points = this.points = [];
    off = this.off += random(this.speed, this.speed * 0.2);
    waveWidth = (this.parent ? length * 1.5 : length) * this.amplitude;
    if (waveWidth > 750) waveWidth = 750;

    for (i = 0, len = this.step + 1; i < len; i++) {
      n = i / 60;
      av = waveWidth * this._noise(n - off, 0) * 0.5;
      ax = sinv * av;
      ay = cosv * av;

      bv = waveWidth * this._noise(n + off, 0) * 0.5;
      bx = sinv * bv;
      by = cosv * bv;

      m = Math.sin(Math.PI * (i / (len - 1)));

      x = startPoint.x + normal.x * i + (ax - bx) * m;
      y = startPoint.y + normal.y * i - (ay - by) * m;

      points.push(new Vector2(x, y));
    }

    children = this.children;

    for (i = 0, len = children.length; i < len; i++) {
      child = children[i];
      child.color = this.color;
      child.speed = this.speed * 1.35;
      child.amplitude = this.amplitude;
      child.lineWidth = this.lineWidth * 0.75;
      child.blur = this.blur;
      child.blurColor = this.blurColor;
      children[i].update();
    }
  },

  draw: function (ctx) {
    var points = this.points,
      children = this.children,
      i,
      len,
      p,
      d;

    // Blur
    if (this.blur) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = this.blur;
      ctx.shadowColor = this.blurColor;
      ctx.beginPath();
      for (i = 0, len = points.length; i < len; i++) {
        p = points[i];
        d = len > 1 ? p.distanceTo(points[i === len - 1 ? i - 1 : i + 1]) : 0;
        ctx.moveTo(p.x + d, p.y);
        ctx.arc(p.x, p.y, d, 0, Math.PI * 2, false);
      }
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.lineWidth = random(this.lineWidth, 0.5);
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    for (i = 0, len = points.length; i < len; i++) {
      p = points[i];
      ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();

    // Draw children
    for (i = 0, len = this.children.length; i < len; i++) {
      children[i].draw(ctx);
    }
  },

  dispose: function () {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
    }
    this._simplexNoise = null;
  },

  _noise: function (v) {
    var octaves = 6,
      fallout = 0.5,
      amp = 1,
      f = 1,
      sum = 0,
      i;

    for (i = 0; i < octaves; ++i) {
      amp *= fallout;
      sum += amp * (this._simplexNoise.noise2D(v * f, 0) + 1) * 0.5;
      f *= 2;
    }

    return sum;
  },

  _setAsChild: function (lightning) {
    if (!(lightning instanceof Lightning)) return;
    this.parent = lightning;

    var self = this,
      setTimer = function () {
        self._updateStepsByParent();
        self._timeoutId = setTimeout(setTimer, randint(1500));
      };

    self._timeoutId = setTimeout(setTimer, randint(1500));
  },

  _updateStepsByParent: function () {
    if (!this.parent) return;
    var parentStep = this.parent.step;
    this.startStep = randint(parentStep - 2);
    this.endStep =
      this.startStep + randint(parentStep - this.startStep - 2) + 2;
    this.step = this.endStep - this.startStep;
  },
};

/**
 * Rect
 */
function Rect(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
  this.right = this.x + this.width;
  this.bottom = this.y + this.height;
}

// Helpers

function random(max, min) {
  if (typeof max !== 'number') {
    return Math.random();
  } else if (typeof min !== 'number') {
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

function randint(max, min) {
  if (!max) return 0;
  return random(max + 1, min) | 0;
}

// Initialize
// Vars

var canvas,
  context,
  centerX,
  centerY,
  grad,
  mouse,
  bounds,
  points,
  lightning,
  control;
// GUI Control

control = {
  childNum: 3,
  color: [255, 255, 255],
  backgroundColor: '#0b5693',
};

// Init

mouse = new Vector2();

lightning = new Lightning();

// Start Update

var loop = function (canvas) {
  bounds = new Rect(0, 0, canvas.width, canvas.height);
  context = canvas.getContext('2d');
  context.save();
  context.fillStyle = control.backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = grad;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();

  lightning.startPoint.set(points[0]);
  lightning.endPoint.set(points[1]);
  lightning.step = Math.ceil(lightning.length() / 10);
  if (lightning.step < 5) lightning.step = 5;

  lightning.update();
  lightning.draw(context);

  var i, p;

  for (i = 0; i < 2; i++) {
    p = points[i];
    if (p.dragging) p.drag(mouse);
    p.update(points, bounds);
    p.draw(context);
  }

  requestAnimationFrame(() => loop(canvas));
};

export function Chain() {
  useElement('#c', (canvas) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.5;

    points = [
      new Point(centerX - 200, centerY, lightning.lineWidth * 1.25),
      new Point(centerX + 200, centerY, lightning.lineWidth * 1.25),
    ];

    lightning.startPoint.set(points[0]);
    lightning.endPoint.set(points[1]);
    lightning.setChildNum(3);

    loop(canvas);
  });

  return <canvas id="c"></canvas>;
}
