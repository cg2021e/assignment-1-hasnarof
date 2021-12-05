import { leftVertices } from "./leftVertices.js";
import { rightVertices } from "./rightVertices.js";

function main() {

    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");

    var vertices = [...leftVertices, ...rightVertices];

    // Create a linked-list for storing the vertices data
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var vertexShaderSource = `
        attribute vec2 aPosition;
        attribute vec3 aColor;
        varying  vec3 vColor;
        uniform mat4 uTranslate;
        void main(){
            gl_Position = uTranslate * vec4(aPosition, 0.0, 1.0); // Center of the coordinate
            vColor = aColor;
        }
    `;

    var fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        void main(){
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

    // Create .c in GPU
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    // Compile .c into .o
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

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
    // the positional values from ARRAY_BUFFER
    // to each vertex being processed
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(aPosition);

    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aColor);

    var speed = 0.0003;
    var dy = 0;
    // Create a uniform to animate the vertices
    const uTranslate = gl.getUniformLocation(shaderProgram, 'uTranslate');

    function render() {
        //control the bouncing range
        if (dy >= 0.50 || dy <= -0.62) speed = -speed;
        dy += speed;

        const rightPosition = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0, dy, 0.0, 1.0,
        ]

        const leftPosition = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0, 0.0, 0.0, 1.0,
        ]

        //coloring canvas
        gl.clearColor(0.7, 0.6, 0.6, 0.8);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniformMatrix4fv(uTranslate, false, leftPosition);
        gl.drawArrays(gl.TRIANGLES, 0, leftVertices.length / 5);

        gl.uniformMatrix4fv(uTranslate, false, rightPosition);
        gl.drawArrays(gl.TRIANGLES, leftVertices.length / 5, rightVertices.length / 5);

        requestAnimationFrame(render);
    }
    render();
}

window.addEventListener('load', main)