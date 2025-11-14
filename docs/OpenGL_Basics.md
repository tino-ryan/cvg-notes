# OpenGL Basics - Section 8

> **Quick guide for Section 8 + Lab 3.1 coding**  
> Includes: Setup, Primitives, Colors, Depth Test, 3D Transforms, Pipeline, Meshes  
> **Tips**: Always `glEnable(GL_DEPTH_TEST)`. Use `glPushMatrix()/glPopMatrix()` for hierarchy. Matrix order = reverse of code. Use `glDrawElements` for efficiency.

---

## 1. Basic Setup (GLUT)

```c
#include <GL/glut.h>

void init() {
    glClearColor(0.0, 0.0, 0.0, 1.0);
    glEnable(GL_DEPTH_TEST);  // CRITICAL for 3D
}

void display() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    // Draw here
    glutSwapBuffers();
}

void reshape(int w, int h) {
    glViewport(0, 0, w, h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(45, (float)w/h, 0.1, 100);
    glMatrixMode(GL_MODELVIEW);
}

int main(int argc, char** argv) {
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(800, 600);
    glutCreateWindow("OpenGL");
    init();
    glutDisplayFunc(display);
    glutReshapeFunc(reshape);
    glutMainLoop();
    return 0;
}
```

---

## 2. Primitives

```c
glBegin(MODE);
    glVertex3f(x, y, z);
glEnd();
```

| Mode | Vertices | Use |
|------|----------|-----|
| `GL_POINTS` | 1 each | Particles |
| `GL_LINES` | 2 each | Wireframe |
| `GL_LINE_STRIP` | N for N-1 lines | Path |
| `GL_LINE_LOOP` | N (closed) | Circle |
| `GL_TRIANGLES` | 3 each | Most meshes |
| `GL_TRIANGLE_STRIP` | N for N-2 tris | Efficient |
| `GL_QUADS` | 4 each | Cube faces |

**Circle:**
```c
void drawCircle(float r, int segs) {
    glBegin(GL_LINE_LOOP);
    for (int i = 0; i < segs; i++) {
        float a = 2*M_PI*i/segs;
        glVertex2f(r*cos(a), r*sin(a));
    }
    glEnd();
}
```

---

## 3. Colors

```c
glColor3f(1, 0, 0);  // Red (RGB 0-1)
glColor3ub(255, 0, 0);  // Red (bytes 0-255)
glColor4f(1, 0, 0, 0.5);  // Transparent red
```

**Per-vertex (smooth):**
```c
glBegin(GL_TRIANGLES);
    glColor3f(1,0,0); glVertex3f(-1,-1,0);
    glColor3f(0,1,0); glVertex3f( 1,-1,0);
    glColor3f(0,0,1); glVertex3f( 0, 1,0);
glEnd();
```

---

## 4. Depth Test (Occlusion)

**Problem:** Painter's algorithm (draw back→front) breaks with overlapping objects.

**Solution:** Depth buffer (Z-buffer)
```c
glEnable(GL_DEPTH_TEST);  // In init()
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);  // Every frame
```

Now draw in **any order** - OpenGL handles visibility automatically.

**Z-Fighting fix:**
```c
gluPerspective(45, aspect, 0.1, 100);  // Reasonable near/far
glPolygonOffset(1, 1);  // For coplanar surfaces
```

---

## 5. 3D Transformations

```c
glTranslatef(x, y, z);        // Move
glRotatef(angle, x, y, z);    // Rotate (degrees, axis)
glScalef(sx, sy, sz);         // Scale
```

**Order matters:** Code order = reverse application
```c
glTranslatef(5, 0, 0);  // Second: move right
glRotatef(45, 0, 0, 1); // First: rotate
drawSquare();
```

**Hierarchy (Matrix Stack):**
```c
void drawRobot() {
    drawBody();
    
    glPushMatrix();  // Save body transform
        glTranslatef(1, 0, 0);
        glRotatef(armAngle, 0, 0, 1);
        drawArm();
    glPopMatrix();  // Restore
}
```

**Rule:** Always match `glPushMatrix()` with `glPopMatrix()`

---

## 6. Transformation Pipeline

```
Object → [Model] → World → [View] → Eye → [Projection] → Clip → Screen
```

**ModelView Matrix:**
```c
glMatrixMode(GL_MODELVIEW);
glLoadIdentity();
gluLookAt(eyeX,eyeY,eyeZ,  centerX,centerY,centerZ,  upX,upY,upZ);
```

**Projection Matrix:**
```c
glMatrixMode(GL_PROJECTION);
glLoadIdentity();

// Perspective (realistic)
gluPerspective(fovY, aspect, near, far);

// Orthographic (no perspective)
glOrtho(left, right, bottom, top, near, far);
```

---

## 7. Meshes (Indexed Drawing)

**Indexed Face Set (IFS):** Store vertices once, reference by index.

```c
GLfloat vertices[] = {
   -1,-1,-1,  1,-1,-1,  1, 1,-1, -1, 1,-1,  // Back
   -1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1   // Front
};

GLfloat colors[] = {
    1,0,0, 0,1,0, 0,0,1, 1,1,0,
    0,1,1, 1,0,1, 1,1,1, 0.5,0.5,0.5
};

GLuint indices[] = {
    0,1,2,3,  4,5,6,7,  0,3,7,4,  // Back, Front, Left
    1,5,6,2,  0,4,5,1,  3,2,6,7   // Right, Bottom, Top
};
```

**glDrawElements (FAST!):**
```c
glEnableClientState(GL_VERTEX_ARRAY);
glEnableClientState(GL_COLOR_ARRAY);

glVertexPointer(3, GL_FLOAT, 0, vertices);
glColorPointer(3, GL_FLOAT, 0, colors);

glDrawElements(GL_QUADS, 24, GL_UNSIGNED_INT, indices);

glDisableClientState(GL_VERTEX_ARRAY);
glDisableClientState(GL_COLOR_ARRAY);
```

**Why?** Cube = 8 vertices (not 36), faster than `glBegin/glEnd`.

---

## 8. WebGL Buffers (Lab 3.1)

```javascript
// Create buffer
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

// Get attribute location
const a_position = gl.getAttribLocation(program, "a_position");

// Configure & enable
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_position);

// Draw
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
```

**Buffer types:**
- `gl.ARRAY_BUFFER` → vertex data
- `gl.ELEMENT_ARRAY_BUFFER` → indices

---

## 9. Lab 3.1 Solution Pattern

**Vertex Shader:**
```glsl
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_modelview;
uniform mat4 u_projection;
varying vec4 v_color;

void main() {
    gl_Position = u_projection * u_modelview * vec4(a_position, 1.0);
    v_color = vec4(a_color, 1.0);
}
```

**Fragment Shader:**
```glsl
precision mediump float;
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
```

**Rotation (JS):**
```javascript
let angle = 0;
function render() {
    angle += 0.01;
    mat4.identity(modelview);
    mat4.translate(modelview, modelview, [0, 0, -8]);
    mat4.rotateY(modelview, modelview, angle);
    mat4.rotateX(modelview, modelview, angle * 0.7);
    
    gl.uniformMatrix4fv(u_modelview, false, modelview);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(render);
}
```

---

## 10. Common Mistakes

| Issue | Fix |
|-------|-----|
| Flickering | `GLUT_DOUBLE` + `glutSwapBuffers()` |
| Wrong visibility | `glEnable(GL_DEPTH_TEST)` |
| Transforms wrong | Order in code = reverse of execution |
| Z-fighting | Better near/far ratio |
| Hierarchy broken | Mismatched Push/Pop |
| WebGL buffer error | Forgot `enableVertexAttribArray()` |

---

## 11. Quick Reference

**Essential Functions:**
```c
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
glColor3f(r, g, b);
glVertex3f(x, y, z);
glTranslatef(x, y, z);
glRotatef(angle, ax, ay, az);
glPushMatrix() / glPopMatrix();
glDrawElements(mode, count, type, indices);
```

**Exam checklist:**
- ✅ Depth test enabled?
- ✅ Clear both buffers?
- ✅ Matrices set correctly?
- ✅ Push/Pop balanced?
- ✅ Attributes enabled in WebGL?