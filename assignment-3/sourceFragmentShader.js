export const sourceFragmentShader = `
    precision mediump float;
    varying vec3 vColor;

    uniform vec3 uLightConstant;
    uniform float uAmbientIntensity;

    varying vec3 vNormal;
    uniform mat3 uNormalModel;
    
    uniform vec3 uLightPosition;
    varying vec3 vPosition;

    uniform vec3 uViewerPosition;

    uniform float uShininessConstant;

    void main() {
        vec3 ambient = uLightConstant * uAmbientIntensity;

        vec3 lightDirection = uLightPosition - vPosition;

        vec3 normalizedLight = normalize(lightDirection);
        vec3 normalizedNormal = normalize(uNormalModel * vNormal);
        float cosTheta = dot(normalizedNormal, normalizedLight);

        vec3 diffuse = vec3(0.0, 0.0, 0.0);
        if (cosTheta > 0.) {
            diffuse = uLightConstant * cosTheta;
        }

        vec3 reflector = reflect(-lightDirection, normalizedNormal);
        vec3 normalizedReflector = normalize(reflector);
        vec3 normalizedViewer = normalize(uViewerPosition - vPosition);
        float cosPhi = dot(normalizedReflector, normalizedViewer);

        vec3 specular = vec3(0.0, 0.0, 0.0);
        if (cosPhi > 0.0) {
            float specularIntensity = pow(cosPhi, uShininessConstant);
            specular = uLightConstant * specularIntensity;
        }

        vec3 phong = ambient + diffuse + specular;

        gl_FragColor = vec4(phong * vColor, 1.0);
    }
`;
