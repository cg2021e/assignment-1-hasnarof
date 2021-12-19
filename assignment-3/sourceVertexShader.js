export const sourceVertexShader = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    attribute vec3 aNormal;
    varying vec3 vNormal;

    varying vec3 vPosition;

    uniform float uScale;

    void main() {
        gl_Position = uProjection * uView * uModel * (vec4(aPosition * uScale, 1.0));

        vColor = aColor;
        vNormal = aNormal;
        vPosition = (uModel * (vec4(aPosition * uScale, 1.0))).xyz;
    }
`;
