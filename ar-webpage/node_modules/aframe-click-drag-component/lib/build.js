'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = aframeDraggableComponent;

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _linear_regression = require('simple-statistics/src/linear_regression');

var _linear_regression2 = _interopRequireDefault(_linear_regression);

var _linear_regression_line = require('simple-statistics/src/linear_regression_line');

var _linear_regression_line2 = _interopRequireDefault(_linear_regression_line);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COMPONENT_NAME = 'click-drag';
var DRAG_START_EVENT = 'dragstart';
var DRAG_MOVE_EVENT = 'dragmove';
var DRAG_END_EVENT = 'dragend';

var TIME_TO_KEEP_LOG = 300;

function cameraPositionToVec3(camera, vec3) {

  var element = camera;

  vec3.set(element.components.position.data.x, element.components.position.data.y, element.components.position.data.z);

  while (element.attachedToParent) {

    element = element.parentElement;

    if (element.components && element.components.position) {
      vec3.set(vec3.x + element.components.position.data.x, vec3.y + element.components.position.data.y, vec3.z + element.components.position.data.z);
    }
  }
}

var _ref = function unprojectFunction() {

  var initialized = false;

  var cameraPosition = void 0;

  var cameraWorld = void 0;
  var matrix = void 0;

  function initialize(THREE) {
    cameraPosition = new THREE.Vector3();

    cameraWorld = new THREE.Matrix4();
    matrix = new THREE.Matrix4();

    return true;
  }

  return {
    unproject: function unproject(THREE, vector, camera) {

      initialized = initialized || initialize(THREE);

      cameraPositionToVec3(camera, cameraPosition);

      cameraWorld.identity();
      cameraWorld.setPosition(cameraPosition);

      matrix.multiplyMatrices(cameraWorld, matrix.getInverse(camera.components.camera.camera.projectionMatrix));

      return vector.applyProjection(matrix);
    }
  };
}();

var unproject = _ref.unproject;


function clientCoordsTo3DCanvasCoords(clientX, clientY, offsetX, offsetY, clientWidth, clientHeight) {
  return {
    x: (clientX - offsetX) / clientWidth * 2 - 1,
    y: -((clientY - offsetY) / clientHeight) * 2 + 1
  };
}

var _ref2 = function screenCoordsToDirectionFunction() {

  var initialized = false;

  var mousePosAsVec3 = void 0;
  var cameraPosAsVec3 = void 0;

  function initialize(THREE) {
    mousePosAsVec3 = new THREE.Vector3();
    cameraPosAsVec3 = new THREE.Vector3();

    return true;
  }

  return {
    screenCoordsToDirection: function screenCoordsToDirection(THREE, aframeCamera, _ref9) {
      var clientX = _ref9.x;
      var clientY = _ref9.y;


      initialized = initialized || initialize(THREE);

      // scale mouse coordinates down to -1 <-> +1

      var _clientCoordsTo3DCanv = clientCoordsTo3DCanvasCoords(clientX, clientY, 0, 0, // TODO: Replace with canvas position
      window.innerWidth, window.innerHeight);

      var mouseX = _clientCoordsTo3DCanv.x;
      var mouseY = _clientCoordsTo3DCanv.y;


      mousePosAsVec3.set(mouseX, mouseY, -1);

      // apply camera transformation from near-plane of mouse x/y into 3d space
      // NOTE: This should be replaced with THREE code directly once the aframe bug
      // is fixed:
      // const projectedVector = new THREE
      //  .Vector3(mouseX, mouseY, -1)
      //  .unproject(threeCamera);
      var projectedVector = unproject(THREE, mousePosAsVec3, aframeCamera);

      cameraPositionToVec3(aframeCamera, cameraPosAsVec3);

      // Get the unit length direction vector from the camera's position

      var _projectedVector$sub$ = projectedVector.sub(cameraPosAsVec3).normalize();

      var x = _projectedVector$sub$.x;
      var y = _projectedVector$sub$.y;
      var z = _projectedVector$sub$.z;


      return { x: x, y: y, z: z };
    }
  };
}();

var screenCoordsToDirection = _ref2.screenCoordsToDirection;

/**
 * @param planeNormal {THREE.Vector3}
 * @param planeConstant {Float} Distance from origin of the plane
 * @param rayDirection {THREE.Vector3} Direction of ray from the origin
 *
 * @return {THREE.Vector3} The intersection point of the ray and plane
 */

function rayPlaneIntersection(planeNormal, planeConstant, rayDirection) {
  // A line from the camera position toward (and through) the plane
  var distanceToPlane = planeConstant / planeNormal.dot(rayDirection);
  return rayDirection.multiplyScalar(distanceToPlane);
}

var _ref3 = function directionToWorldCoordsFunction() {

  var initialized = false;

  var direction = void 0;
  var cameraPosAsVec3 = void 0;

  function initialize(THREE) {
    direction = new THREE.Vector3();
    cameraPosAsVec3 = new THREE.Vector3();

    return true;
  }

  return {
    /**
     * @param camera Three.js Camera instance
     * @param Object Position of the camera
     * @param Object position of the mouse (scaled to be between -1 to 1)
     * @param depth Depth into the screen to calculate world coordinates for
     */
    directionToWorldCoords: function directionToWorldCoords(THREE, aframeCamera, camera, _ref10, depth) {
      var directionX = _ref10.x;
      var directionY = _ref10.y;
      var directionZ = _ref10.z;


      initialized = initialized || initialize(THREE);

      cameraPositionToVec3(aframeCamera, cameraPosAsVec3);
      direction.set(directionX, directionY, directionZ);

      // A line from the camera position toward (and through) the plane
      var newPosition = rayPlaneIntersection(camera.getWorldDirection(), depth, direction);

      // Reposition back to the camera position

      var _newPosition$add = newPosition.add(cameraPosAsVec3);

      var x = _newPosition$add.x;
      var y = _newPosition$add.y;
      var z = _newPosition$add.z;


      return { x: x, y: y, z: z };
    }
  };
}();

var directionToWorldCoords = _ref3.directionToWorldCoords;

var _ref4 = function selectItemFunction() {

  var initialized = false;

  var cameraPosAsVec3 = void 0;
  var directionAsVec3 = void 0;
  var raycaster = void 0;
  var plane = void 0;

  function initialize(THREE) {
    plane = new THREE.Plane();
    cameraPosAsVec3 = new THREE.Vector3();
    directionAsVec3 = new THREE.Vector3();
    raycaster = new THREE.Raycaster();

    // TODO: From camera values?
    raycaster.far = Infinity;
    raycaster.near = 0;

    return true;
  }

  return {
    selectItem: function selectItem(THREE, selector, camera, clientX, clientY) {

      initialized = initialized || initialize(THREE);

      var _screenCoordsToDirect = screenCoordsToDirection(THREE, camera, { x: clientX, y: clientY });

      var directionX = _screenCoordsToDirect.x;
      var directionY = _screenCoordsToDirect.y;
      var directionZ = _screenCoordsToDirect.z;


      cameraPositionToVec3(camera, cameraPosAsVec3);
      directionAsVec3.set(directionX, directionY, directionZ);

      raycaster.set(cameraPosAsVec3, directionAsVec3);

      // Push meshes onto list of objects to intersect.
      // TODO: Can we do this at some other point instead of every time a ray is
      // cast? Is that a micro optimization?
      var objects = Array.from(camera.sceneEl.querySelectorAll('[' + selector + ']')).map(function (object) {
        return object.object3D;
      });

      var recursive = true;

      var intersected = raycaster.intersectObjects(objects, recursive)
      // Only keep intersections against objects that have a reference to an entity.
      .filter(function (intersection) {
        return !!intersection.object.el;
      })
      // Only keep ones that are visible
      .filter(function (intersection) {
        return intersection.object.parent.visible;
      })
      // The first element is the closest
      [0]; // eslint-disable-line no-unexpected-multiline

      if (!intersected) {
        return {};
      }

      var point = intersected.point;
      var object = intersected.object;

      // Aligned to the world direction of the camera
      // At the specified intersection point

      plane.setFromNormalAndCoplanarPoint(camera.components.camera.camera.getWorldDirection().clone().negate(), point.clone().sub(cameraPosAsVec3));

      var depth = plane.constant;

      var offset = point.sub(object.getWorldPosition());

      return { depth: depth, offset: offset, element: object.el };
    }
  };
}();

var selectItem = _ref4.selectItem;


function dragItem(THREE, element, offset, camera, depth, mouseInfo) {
  var offsetX = offset.x;
  var offsetY = offset.y;
  var offsetZ = offset.z;

  var lastMouseInfo = mouseInfo;

  function onMouseMove(_ref5) {
    var clientX = _ref5.clientX;
    var clientY = _ref5.clientY;


    lastMouseInfo = { clientX: clientX, clientY: clientY };

    var direction = screenCoordsToDirection(THREE, camera, { x: clientX, y: clientY });

    var _directionToWorldCoor = directionToWorldCoords(THREE, camera, camera.components.camera.camera, direction, depth);

    var x = _directionToWorldCoor.x;
    var y = _directionToWorldCoor.y;
    var z = _directionToWorldCoor.z;


    var nextPosition = { x: x - offsetX, y: y - offsetY, z: z - offsetZ };

    element.emit(DRAG_MOVE_EVENT, { nextPosition: nextPosition, clientX: clientX, clientY: clientY });

    element.setAttribute('position', nextPosition);
  }

  function onCameraMove(_ref6) {
    var detail = _ref6.detail;

    if (detail.name === 'position' && !(0, _deepEqual2.default)(detail.oldData, detail.newData)) {
      onMouseMove(lastMouseInfo);
    }
  }

  document.addEventListener('mousemove', onMouseMove);
  camera.addEventListener('componentchanged', onCameraMove);

  // The "unlisten" function
  return function (_) {
    document.removeEventListener('mousemove', onMouseMove);
    camera.removeEventListener('componentchanged', onCameraMove);
  };
}

// Closure to close over the removal of the event listeners

var _ref7 = function closeOverInitAndTearDown() {

  var removeClickListeners = void 0;

  return {
    initialize: function initialize(THREE, componentName) {

      // TODO: Based on a scene from the element passed in?
      var scene = document.querySelector('a-scene');
      // delay loading of this as we're not 100% if the scene has loaded yet or not
      var camera = void 0;
      var removeDragListeners = void 0;
      var draggedElement = void 0;
      var dragInfo = void 0;
      var positionLog = [];

      function cleanUpPositionLog() {
        var now = performance.now();
        while (positionLog.length && now - positionLog[0].time > TIME_TO_KEEP_LOG) {
          // remove the first element;
          positionLog.shift();
        }
      }

      function onDragged(_ref11) {
        var nextPosition = _ref11.detail.nextPosition;

        // Continuously clean up so we don't get huge logs built up
        cleanUpPositionLog();
        positionLog.push({
          position: Object.assign({}, nextPosition),
          time: performance.now()
        });
      }

      function onMouseDown(_ref12) {
        var clientX = _ref12.clientX;
        var clientY = _ref12.clientY;

        var _selectItem = selectItem(THREE, componentName, camera, clientX, clientY);

        var depth = _selectItem.depth;
        var offset = _selectItem.offset;
        var element = _selectItem.element;


        if (element) {
          (function () {
            // Can only drag one item at a time, so no need to check if any
            // listener is already set up
            var removeDragItemListeners = dragItem(THREE, element, offset, camera, depth, {
              clientX: clientX,
              clientY: clientY
            });

            draggedElement = element;

            dragInfo = {
              offset: { x: offset.x, y: offset.y, z: offset.z },
              depth: depth,
              clientX: clientX,
              clientY: clientY
            };

            element.emit(DRAG_START_EVENT, dragInfo);

            element.addEventListener(DRAG_MOVE_EVENT, onDragged);

            removeDragListeners = function removeDragListeners(_) {
              element.removeEventListener(DRAG_MOVE_EVENT, onDragged);
              // eslint-disable-next-line no-unused-expressions
              removeDragItemListeners && removeDragItemListeners();
              // in case this removal function gets called more than once
              removeDragItemListeners = null;
            };
          })();
        }
      }

      function fitLineToVelocity(dimension) {

        if (positionLog.length < 2) {
          return 0;
        }

        var velocities = positionLog

        // Pull out just the x, y, or z values
        .map(function (log) {
          return { time: log.time, value: log.position[dimension] };
        })

        // Then convert that into an array of array pairs [time, value]
        .reduce(function (memo, log, index, collection) {

          // skip the first item (we're looking for pairs)
          if (index === 0) {
            return memo;
          }

          var deltaPosition = log.value - collection[index - 1].value;
          var deltaTime = (log.time - collection[index - 1].time) / 1000;

          // The new value is the change in position
          memo.push([log.time, deltaPosition / deltaTime]);

          return memo;
        }, []);

        // Calculate the line function
        var lineFunction = (0, _linear_regression_line2.default)((0, _linear_regression2.default)(velocities));

        // Calculate what the point was at the end of the line
        // ie; the velocity at the time the drag stopped
        return lineFunction(positionLog[positionLog.length - 1].time);
      }

      function onMouseUp(_ref13) {
        var clientX = _ref13.clientX;
        var clientY = _ref13.clientY;


        cleanUpPositionLog();

        var velocity = {
          x: fitLineToVelocity('x'),
          y: fitLineToVelocity('y'),
          z: fitLineToVelocity('z')
        };

        draggedElement.emit(DRAG_END_EVENT, Object.assign({}, dragInfo, { clientX: clientX, clientY: clientY, velocity: velocity }));

        removeDragListeners && removeDragListeners(); // eslint-disable-line no-unused-expressions
        removeDragListeners = undefined;
      }

      function run() {

        camera = scene.camera.el;

        // TODO: Attach to canvas?
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);

        removeClickListeners = function removeClickListeners(_) {
          document.removeEventListener('mousedown', onMouseDown);
          document.removeEventListener('mouseup', onMouseUp);
        };
      }

      if (scene.hasLoaded) {
        run();
      } else {
        scene.addEventListener('loaded', run);
      }
    },
    tearDown: function tearDown() {
      removeClickListeners && removeClickListeners(); // eslint-disable-line no-unused-expressions
      removeClickListeners = undefined;
    }
  };
}();

var initialize = _ref7.initialize;
var tearDown = _ref7.tearDown;

var _ref8 = function getDidMountAndUnmount() {

  var cache = [];

  return {
    didMount: function didMount(element, THREE, componentName) {

      if (cache.length === 0) {
        initialize(THREE, componentName);
      }

      if (cache.indexOf(element) === -1) {
        cache.push(element);
      }
    },
    didUnmount: function didUnmount(element) {

      var cacheIndex = cache.indexOf(element);

      if (cacheIndex === -1) {
        return;
      }

      // remove that element
      cache.splice(cacheIndex, 1);

      if (cache.length === 0) {
        tearDown();
      }
    }
  };
}();

var didMount = _ref8.didMount;
var didUnmount = _ref8.didUnmount;

/**
 * @param aframe {Object} The Aframe instance to register with
 * @param componentName {String} The component name to use. Default: 'click-drag'
 */

function aframeDraggableComponent(aframe) {
  var componentName = arguments.length <= 1 || arguments[1] === undefined ? COMPONENT_NAME : arguments[1];


  var THREE = aframe.THREE;

  /**
   * Draggable component for A-Frame.
   */
  aframe.registerComponent(componentName, {
    schema: {},

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function init() {
      didMount(this, THREE, componentName);
    },


    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     *
     * @param oldData
     */
    update: function update() {},


    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove: function remove() {
      didUnmount();
    },


    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause: function pause() {
      didUnmount();
    },


    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function play() {
      didMount(this, THREE, componentName);
    }
  });
}
