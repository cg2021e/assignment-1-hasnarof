// argument vertices1, vertices2, ...
export const mergeVertices = (...verticesArray) => {
    const returnVertices = []

    verticesArray.forEach(vertices => {
        returnVertices.push(...vertices.flat())
    });

    return returnVertices;
};

// argument indices1, indices2, ...
export const mergeIndices = (...indicesArray) => {
    const indicesCount = [];
    const returnIndices = [];
    const indexMax = [];

    indicesArray.forEach(indices => {
        const indicesFlat = indices.flat();

        indicesCount.push(indicesFlat.length);
        returnIndices.push(...indicesFlat.map(index => index + indexMax.reduce((acc, curr) => acc + curr, 0)));
        indexMax.push(Math.max(...indicesFlat) + 1);
    });

    return [indicesCount, returnIndices];
};

// argument [vertices1, indices1], [vertices2, indices2], ...
export const mergeVerticesAndIndices = (...verticesAndIndicesArray) => {
    const verticesArray = verticesAndIndicesArray.map(verticesAndIndices => verticesAndIndices[0]);
    const indiesArray = verticesAndIndicesArray.map(verticesAndIndices => verticesAndIndices[1]);

    return [mergeVertices(...verticesArray), ...mergeIndices(...indiesArray)];
};

// argument vertices, indices for a face
export const getFaceSurfaceNormal = (vertices, indices) => {
    const surfaceNormal = [0, 0, 0];

    if (indices.length === 3) {
        const u = vertices[indices[1]].map((val, index) => val - vertices[indices[0]][index]);
        const v = vertices[indices[2]].map((val, index) => val - vertices[indices[0]][index]);

        surfaceNormal[0] = u[1] * v[2] - u[2] * v[1];
        surfaceNormal[1] = u[2] * v[0] - u[0] * v[2];
        surfaceNormal[2] = u[0] * v[1] - u[1] * v[0];
    } else {
        indices.forEach((val, i) => {
            const curr = vertices[val];
            const next = vertices[indices[(i + 1) % indices.length]];

            surfaceNormal[0] += (curr[1] - next[1]) * (curr[2] + next[2]);
            surfaceNormal[1] += (curr[2] - next[2]) * (curr[0] + next[0]);
            surfaceNormal[2] += (curr[0] - next[0]) * (curr[1] + next[1]);
        });
    }

    return surfaceNormal;
};

// argument vertices, all indices for that vertice
export const getVerticesWithSurfaceNormal = (vertices, indices) => {
    const verticesWithNormal = [];

    let i = 0;
    indices.forEach(val => {
        val.forEach(index => {
            verticesWithNormal.push(...vertices[index], ...(getFaceSurfaceNormal(vertices, val)));
        })
        i++;
    });

    return verticesWithNormal;
};

// argument [vertices1, indices1], [vertices2, indices2], ...
export const getAllVerticesWithSurfaceNormal = (...verticesAndIndicesArray) => {
    const verticesArray = verticesAndIndicesArray.map(verticesAndIndices => verticesAndIndices[0]);
    const indicesArray = verticesAndIndicesArray.map(verticesAndIndices => verticesAndIndices[1]);

    const surfaceNormalArray = [];

    verticesArray.forEach((vertices, index) => {
        surfaceNormalArray.push(getVerticesWithSurfaceNormal(vertices, indicesArray[index]));
    });

    return surfaceNormalArray;
};