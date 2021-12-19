// import { mat4, mat3, vec3, quat } from "./gl-matrix-min.js";
import { mat4, mat3, vec3, quat } from "./gl-matrix/index.js";
import { verticesJar } from "./vertices.js";
import { objectLeft, indicesObjectLeft } from "./objectLeft.js";
import { objectRight, indicesObjectRight } from "./objectRight.js";
import { objectLight, indicesObjectLight } from "./objectLight.js";
import { objectPlane, indicesObjectPlane } from "./objectPlane.js";
import { sourceVertexShader } from "./sourceVertexShader.js";
import { sourceFragmentShader } from "./sourceFragmentShader.js";
import { shaderFragment } from "./shaderFragment.js";
import { shaderVertex } from "./shaderVertex.js";

window.onload = () => {
  //Access the canvas through DOM: Document Object Model
  var canvas = document.getElementById("Canvas"); // The paper
  var gl = canvas.getContext("webgl"); // The brush and the paints

  // Define vertices data consisting of position and color properties
  var y_cube = [...objectLight];
  var vertices = [];

  var indices = [
    ...indicesObjectRight,
    ...indicesObjectLeft,
    ...indicesObjectLight,
    ...indicesObjectPlane,
  ];

  // Create a linked-list for storing the vertices data
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Create a linked-list for storing the indices data
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Create .c in GPU
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, shaderVertex);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, shaderFragment);

  // Compile .c into .o
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);
  let compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error(gl.getShaderInfoLog(vertexShader));
  }

  // Prepare a .exe shell (shader program)
  var shaderProgram = gl.createProgram();

  // Put the two .o files into the shell
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  // Link the two .o files, so together they can be a runnable program/context.
  gl.linkProgram(shaderProgram);

  // Start using the context (analogy: start using the paints and the brushes)
  gl.useProgram(shaderProgram);

  // Teach the computer how to collect
  //  the positional values from ARRAY_BUFFER
  //  to each vertex being processed
  var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.vertexAttribPointer(
    aPosition,
    3,
    gl.FLOAT,
    false,
    10 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(aPosition);
  var aColor = gl.getAttribLocation(shaderProgram, "aColor");
  gl.vertexAttribPointer(
    aColor,
    3,
    gl.FLOAT,
    false,
    10 * Float32Array.BYTES_PER_ELEMENT,
    6 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(aColor);
  var aNormal = gl.getAttribLocation(shaderProgram, "aNormal");
  gl.vertexAttribPointer(
    aNormal,
    3,
    gl.FLOAT,
    false,
    10 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(aNormal);

  var aShininessConstant = gl.getAttribLocation(
    shaderProgram,
    "aShininessConstant"
  );
  gl.vertexAttribPointer(
    aShininessConstant,
    1,
    gl.FLOAT,
    false,
    10 * Float32Array.BYTES_PER_ELEMENT,
    9 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(aShininessConstant);

  // Connect the uniform transformation matrices
  var uModel = gl.getUniformLocation(shaderProgram, "uModel");
  var uView = gl.getUniformLocation(shaderProgram, "uView");
  var uProjection = gl.getUniformLocation(shaderProgram, "uProjection");

  // Set the projection matrix in the vertex shader
  var projection = mat4.create();
  mat4.perspective(
    projection,
    Math.PI / 3, // field of view
    1, // ratio
    0.5, // near clip
    10 // far clip
  );
  gl.uniformMatrix4fv(uProjection, false, projection);

  // Set the view matrix in the vertex shader
  var view = mat4.create();
  var camera = [0, 0, 3];
  var camNow = [0, 0, 0];
  mat4.lookAt(
    view,
    camera, // camera position
    camNow, // the point where camera looks at
    [0, 1, 0] // up vector of the camera
  );
  gl.uniformMatrix4fv(uView, false, view);

  // Define the lighting and shading
  var uLightConstant = gl.getUniformLocation(shaderProgram, "uLightConstant");
  var uAmbientIntensity = gl.getUniformLocation(
    shaderProgram,
    "uAmbientIntensity"
  );
  gl.uniform3fv(uLightConstant, [1.0, 1.0, 1.0]); // white light
  gl.uniform1f(uAmbientIntensity, 0.203); // light intensity: 003 (NRP) + 200 = 376 * 100%
  // var uLightDirection = gl.getUniformLocation(shaderProgram, "uLightDirection");
  // gl.uniform3fv(uLightDirection, [2.0, 0.0, 0.0]);    // light comes from the right side
  var uLightPosition = gl.getUniformLocation(shaderProgram, "uLightPosition");
  var lightPosition = [0.0, 0.0, 0.0];
  gl.uniform3fv(uLightPosition, lightPosition);
  var uNormalModel = gl.getUniformLocation(shaderProgram, "uNormalModel");
  var uViewerPosition = gl.getUniformLocation(shaderProgram, "uViewerPosition");
  gl.uniform3fv(uViewerPosition, camera);

  function render() {
    // vertices = [...objectRight, ...objectLeft, ...y_cube];
    // vertices = [...objectLeft, ...objectRight, ...y_cube];
    vertices = [...objectLeft, ...objectRight, ...y_cube, ...objectPlane];

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.uniform3fv(uLightPosition, lightPosition);

    // Init the model matrix
    var model = mat4.create();
    gl.uniformMatrix4fv(uModel, false, model);
    // Set the model matrix for normal vector
    var normalModel = mat3.create();
    mat3.normalFromMat4(normalModel, model);
    gl.uniformMatrix3fv(uNormalModel, false, normalModel);
    // Reset the frame buffer
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
};
