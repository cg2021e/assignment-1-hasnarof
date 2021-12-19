export const shaderVertex = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        attribute vec3 aNormal;
        attribute float aShininessConstant;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vShininessConstant;
        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProjection;
        void main() {
            gl_Position = uProjection * uView * uModel * (vec4(aPosition * 2. / 3., 1.5));
            vColor = aColor;
            vNormal = aNormal;
            vPosition = (uModel * (vec4(aPosition * 2. / 3., 1.5))).xyz;
            vShininessConstant = aShininessConstant;
        }
    `;
