import { verticesJar, indicesJar } from "./objectJar.js";
import { verticesPlane, indicesPlane } from "./objectPlane.js";
import { verticesCube, indicesCube } from "./objectCube.js";
import { sourceVertexShader } from "./sourceVertexShader.js";
import { sourceFragmentShader } from "./sourceFragmentShader.js";
import { mergeIndices, mergeVertices, getAllVerticesWithSurfaceNormal } from "./utils.js";

window.onload = () => {
  /**
   *  @type {HTMLCanvasElement} canvas
   */
  const canvas = document.getElementById("Canvas");

  /**
   *  @type {WebGLRenderingContext} gl
   */
  const gl = canvas.getContext("webgl");

  const verticeAndIndices = [
    [verticesJar, indicesJar],
    [verticesJar, indicesJar],
    [verticesCube, indicesCube],
    [verticesPlane, indicesPlane],
  ];

  const [indicesCount] = mergeIndices(...verticeAndIndices.map((elem) => elem[1]));
  const vertices = mergeVertices(getAllVerticesWithSurfaceNormal(...verticeAndIndices));

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, sourceVertexShader);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, sourceFragmentShader);
  gl.compileShader(fragmentShader);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  gl.useProgram(shaderProgram);

  const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(aPosition);

  const aColor = gl.getAttribLocation(shaderProgram, "aColor");
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aColor);

  const aNormal = gl.getAttribLocation(shaderProgram, "aNormal");
  gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aNormal);

  const uModel = gl.getUniformLocation(shaderProgram, "uModel");
  const uView = gl.getUniformLocation(shaderProgram, "uView");
  const uProjection = gl.getUniformLocation(shaderProgram, "uProjection");

  const projection = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projection, Math.PI / 3, 1, 0.5, 10);
  gl.uniformMatrix4fv(uProjection, false, projection);

  const uLightConstant = gl.getUniformLocation(shaderProgram, "uLightConstant");
  const uAmbientIntensity = gl.getUniformLocation(shaderProgram, "uAmbientIntensity");
  gl.uniform3fv(uLightConstant, [1, 1, 1]);

  const uLightPosition = gl.getUniformLocation(shaderProgram, "uLightPosition");

  const uNormalModel = gl.getUniformLocation(shaderProgram, "uNormalModel");

  const uViewerPosition = gl.getUniformLocation(shaderProgram, "uViewerPosition");

  const uShininessConstant = gl.getUniformLocation(shaderProgram, "uShininessConstant");

  const uIsLightOn = gl.getUniformLocation(shaderProgram, "uIsLightOn");

  const scale = 0.6;
  const uScale = gl.getUniformLocation(shaderProgram, "uScale");
  gl.uniform1f(uScale, scale);

  // const camera = [0, 0, 3];
  const camera = [0, 2, 3];
  const lightCube = [0, 0, 0];
  // const lightCube = [0, 0, 1];

  const models = [glMatrix.mat4.create(), glMatrix.mat4.create(), glMatrix.mat4.create(), glMatrix.mat4.create()];

  // model for left
  glMatrix.mat4.translate(models[0], models[0], [-0.8, 0, 0]);

  // model for right
  glMatrix.mat4.translate(models[1], models[1], [0.8, 0, 0]);
  glMatrix.mat4.rotateY(models[1], models[1], -Math.PI / 2);

  // model for cube;
  glMatrix.mat4.translate(models[2], models[2], lightCube);

  // model for plane
  const bottomVertices = Math.min(...verticesJar.map((elem) => elem[1]));
  glMatrix.mat4.translate(models[3], models[3], [0, bottomVertices * scale, 0]);

  const view = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(view, camera, [camera[0], -0.1, 0], [0, 1, 0]);
  // glMatrix.mat4.lookAt(view, camera, [0.5, 0, 0], [0, 0, 0]);
  gl.uniformMatrix4fv(uView, false, view);
  gl.uniform3fv(uViewerPosition, camera);

  gl.uniform3fv(uLightPosition, lightCube);

  // constant for each model
  const shininessConstants = [5, 200, 0, 0];
  const ambientIntensities = [0.203, 0.203, 1, 1];
  // const ambientIntensities = [0.203, 0.203, 1, 1];
  // const ambientIntensities = [0, 0, 0, 0];

  const lightCubeSpeed = 0.01;
  let lightCubeMoveDirX = 0; // 0 - nothing, 1 - right, -1 - left
  let lightCubeMoveDirZ = 0; // 0 - nothing, 1 - forward (away from screen), -1 - backward

  const zoomSpeed = 0.01;
  let zoomDir = 0; // 0 - nothing, 1 - zoom in, -1 - zoom out
  const distanceMin = 1;

  const cameraRotateSpeed = 0.01;
  let cameraRotateDir = 0; // 0 - nothing, 1 - rotate right, -1 - rotate left
  let cameraRotation = 0;

  let isLightOn = true;
  window.addEventListener("keydown", (e) => {
    if (e.code == "Space") {
      isLightOn = !isLightOn;
      ambientIntensities[2] = isLightOn;
    }

    if (e.code === "KeyD") lightCubeMoveDirX = 1;
    else if (e.code === "KeyA") lightCubeMoveDirX = -1;

    if (e.code === "KeyW") lightCubeMoveDirZ = 1;
    else if (e.code === "KeyS") lightCubeMoveDirZ = -1;

    if (e.code === "ArrowUp") zoomDir = 1;
    else if (e.code === "ArrowDown") zoomDir = -1;

    if (e.code === "ArrowRight") cameraRotateDir = 1;
    else if (e.code === "ArrowLeft") cameraRotateDir = -1;
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "KeyD" || e.code === "KeyA") lightCubeMoveDirX = 0;

    if (e.code === "KeyW" || e.code === "KeyS") lightCubeMoveDirZ = 0;

    if (e.code === "ArrowUp" || e.code === "ArrowDown") zoomDir = 0;

    if (e.code === "ArrowRight" || e.code === "ArrowLeft") cameraRotateDir = 0;
  });

  let lastPointOnTrackBall, currentPointOnTrackBall;
  let lastQuat = glMatrix.quat.create();
  function computeCurrentQuat() {
    const axisFromCrossProduct = glMatrix.vec3.cross(glMatrix.vec3.create(), lastPointOnTrackBall, currentPointOnTrackBall);
    const angleFromDotProduct = Math.acos(glMatrix.vec3.dot(lastPointOnTrackBall, currentPointOnTrackBall));
    const rotationQuat = glMatrix.quat.setAxisAngle(glMatrix.quat.create(), axisFromCrossProduct, angleFromDotProduct);
    glMatrix.quat.normalize(rotationQuat, rotationQuat);
    return glMatrix.quat.multiply(glMatrix.quat.create(), rotationQuat, lastQuat);
  }

  function getProjectionPointOnSurface(point) {
    const radius = canvas.width / 2;
    const center = glMatrix.vec3.fromValues(window.innerWidth / 2, window.innerHeight / 2, 0);
    const pointVector = glMatrix.vec3.subtract(glMatrix.vec3.create(), point, center);
    pointVector[1] = pointVector[1] * -1;
    const radius2 = radius * radius;
    const length2 = pointVector[0] * pointVector[0] + pointVector[1] * pointVector[1];
    if (length2 <= radius2) pointVector[2] = Math.sqrt(radius2 - length2);
    else {
      pointVector[0] *= radius / Math.sqrt(length2);
      pointVector[1] *= radius / Math.sqrt(length2);
      pointVector[2] = 0;
    }
    return glMatrix.vec3.normalize(glMatrix.vec3.create(), pointVector);
  }

  const rotation = glMatrix.mat4.create();
  let dragging;

  document.addEventListener("mousedown", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const rect = e.target.getBoundingClientRect();
    if (rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y) {
      dragging = true;
    }

    lastPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0));
    currentPointOnTrackBall = lastPointOnTrackBall;
  });

  document.addEventListener("mouseup", (e) => {
    dragging = false;
    if (currentPointOnTrackBall != lastPointOnTrackBall) {
      lastQuat = computeCurrentQuat();
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (dragging) {
      var x = e.clientX;
      var y = e.clientY;
      currentPointOnTrackBall = getProjectionPointOnSurface(glMatrix.vec3.fromValues(x, y, 0));
      glMatrix.mat4.fromQuat(rotation, computeCurrentQuat());
    }
  });

  function render() {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    lightCube[0] += lightCubeMoveDirX * lightCubeSpeed;
    lightCube[2] += -lightCubeMoveDirZ * lightCubeSpeed;

    cameraRotation += cameraRotateDir * cameraRotateSpeed;

    const view = glMatrix.mat4.create();
    const angle = glMatrix.vec3.angle(camera, [0, 0, 0]);
    const curDistance = glMatrix.vec3.distance(camera, [0, 0, 0]);
    const newDistance = curDistance - zoomDir * zoomSpeed;
    if (newDistance >= distanceMin) {
      camera[1] = Math.cos(angle) * newDistance;
      camera[2] = Math.sin(angle) * newDistance;
    }
    const curCameraPosition = glMatrix.vec3.rotateY(glMatrix.vec3.create(), camera, [0, 0, 0], cameraRotation);
    glMatrix.mat4.lookAt(view, curCameraPosition, [0, 0, 0], [0, 1, 0]);

    gl.uniformMatrix4fv(uView, false, view);
    gl.uniform3fv(uViewerPosition, camera);

    // model for cube;
    glMatrix.mat4.multiply(models[2], glMatrix.mat4.create(), rotation);
    glMatrix.mat4.translate(models[2], glMatrix.mat4.create(), lightCube);

    gl.uniform3fv(uLightPosition, lightCube);

    gl.uniform1i(uIsLightOn, isLightOn);

    let count = 0;
    indicesCount.forEach((v, i) => {
      gl.uniformMatrix4fv(uModel, false, models[i]);

      const normalModel = glMatrix.mat3.create();
      glMatrix.mat3.normalFromMat4(normalModel, models[i]);
      gl.uniformMatrix3fv(uNormalModel, false, normalModel);

      gl.uniform1f(uShininessConstant, shininessConstants[i]);
      gl.uniform1f(uAmbientIntensity, ambientIntensities[i]);

      gl.drawArrays(gl.TRIANGLES, count, indicesCount[i]);
      count += indicesCount[i];
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
};

//
