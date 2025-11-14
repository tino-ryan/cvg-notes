# OpenGL Lighting - Section 9

> **Quick guide for Section 9 + Lab 3.2**  
> Includes: Lights, Materials, Normals, Shading, Lambert, Phong, Cell Shading  
> **Tips**: Always `glEnable(GL_LIGHTING)` + `GL_LIGHT0`. Use `glNormal3f()` before vertices. Normalize interpolated normals in shaders. Per-fragment = better quality.

---

## 1. Enable Lighting

```c
glEnable(GL_LIGHTING);
glEnable(GL_LIGHT0);  // Up to 8 lights: GL_LIGHT0-7
```

**Important:** Once enabled, `glColor3f()` is ignored. Use materials instead.

---

## 2. Lights

**Properties:**
```c
float pos[] = {5, 5, 5, 1};   // Point light (w=1)
float dir[] = {0, -1, 0, 0};  // Directional (w=0)
float white[] = {1, 1, 1, 1};
float dim[] = {0.2, 0.2, 0.2, 1};

glLightfv(GL_LIGHT0, GL_POSITION, pos);
glLightfv(GL_LIGHT0, GL_AMBIENT, dim);
glLightfv(GL_LIGHT0, GL_DIFFUSE, white);
glLightfv(GL_LIGHT0, GL_SPECULAR, white);
```

| Component | Effect |
|-----------|--------|
| `GL_AMBIENT` | Background glow (no direction) |
| `GL_DIFFUSE` | Main color (Lambert shading) |
| `GL_SPECULAR` | Shiny highlights |
| `GL_POSITION` | `[x,y,z,w]` - w=1:point, w=0:directional |

**Global ambient:**
```c
float globalAmb[] = {0.3, 0.3, 0.3, 1};
glLightModelfv(GL_LIGHT_MODEL_AMBIENT, globalAmb);
```

---

## 3. Materials

```c
float color[] = {0.8, 0.1, 0.1, 1};  // Red
float shiny[] = {1.0, 1.0, 1.0, 1};
float none[] = {0, 0, 0, 1};

glMaterialfv(GL_FRONT_AND_BACK, GL_AMBIENT_AND_DIFFUSE, color);
glMaterialfv(GL_FRONT_AND_BACK, GL_SPECULAR, shiny);
glMaterialf(GL_FRONT_AND_BACK, GL_SHININESS, 50);  // 0-128
glMaterialfv(GL_FRONT_AND_BACK, GL_EMISSION, none);
```

**Shininess:** Higher = smaller, sharper highlight (0=dull, 128=mirror)

---

## 4. Normals (CRITICAL!)

Must provide for lighting to work.

```c
glNormal3f(0, 0, 1);  // Front face
glBegin(GL_QUADS);
    glVertex3f(-1, -1, 1);
    glVertex3f( 1, -1, 1);
    glVertex3f( 1,  1, 1);
    glVertex3f(-1,  1, 1);
glEnd();
```

**Types:**
- One normal per face → **Flat shading**
- One normal per vertex (averaged) → **Smooth shading**

**Sphere normals (easy):**
```c
// For unit sphere: normal = position
glNormal3f(x, y, z);
glVertex3f(x, y, z);
```

---

## 5. Lighting Equation

```
I = Emission + Global_Ambient + Σ(Ambient + Diffuse + Specular)
```

### Per Light:

**Ambient:** Always present
```
I_amb = light_ambient × material_ambient
```

**Diffuse (Lambert):** Depends on surface angle to light
```
I_diff = light_diffuse × material_diffuse × max(0, N·L)
```

**Specular (Phong):** Depends on reflection angle to viewer
```
R = 2(N·L)N - L
I_spec = light_specular × material_specular × max(0, R·V)^shininess
```

**Where:**
- N = surface normal (unit)
- L = light direction (surface → light)
- V = view direction (surface → camera)
- R = reflection vector

---

## 6. Shading Types

```c
glShadeModel(GL_FLAT);    // One color per polygon
glShadeModel(GL_SMOOTH);  // Interpolate (default)
```

| Type | Calculation | Quality |
|------|-------------|---------|
| **Flat** | Per-face | Fast, faceted |
| **Gouraud (Smooth)** | Per-vertex, interpolate colors | Good |
| **Phong** | Per-pixel (needs shaders) | Best |

---

## 7. Complete Example (Old OpenGL)

```c
void display() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glLoadIdentity();
    gluLookAt(3, 4, 5, 0, 0, 0, 0, 1, 0);
    
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    
    // Light
    float lightPos[] = {5, 5, 5, 1};
    float white[] = {1, 1, 1, 1};
    glLightfv(GL_LIGHT0, GL_POSITION, lightPos);
    glLightfv(GL_LIGHT0, GL_DIFFUSE, white);
    glLightfv(GL_LIGHT0, GL_SPECULAR, white);
    
    // Material
    float red[] = {0.8, 0.1, 0.1, 1};
    float shiny[] = {1, 1, 1, 1};
    glMaterialfv(GL_FRONT, GL_AMBIENT_AND_DIFFUSE, red);
    glMaterialfv(GL_FRONT, GL_SPECULAR, shiny);
    glMaterialf(GL_FRONT, GL_SHININESS, 80);
    
    drawCube();  // Must have normals!
    
    glutSwapBuffers();
}
```

---

## 8. Lab 3.2: Lambert + Cell Shading

### Vertex Shader (Pass data to fragment)

```glsl
attribute vec3 a_coords;
attribute vec3 a_normal;
uniform mat4 modelview;
uniform mat4 projection;
uniform mat3 normalMatrix;  // For normals!
uniform vec4 lightPosition;

varying vec3 v_normal;
varying vec3 v_eyeCoords;

void main() {
    vec4 coords = vec4(a_coords, 1.0);
    v_eyeCoords = (modelview * coords).xyz;
    gl_Position = projection * modelview * coords;
    
    // Transform normal (use normalMatrix, NOT modelview!)
    v_normal = normalize(normalMatrix * a_normal);
}
```

### Fragment Shader (Phong Lighting)

```glsl
precision mediump float;

varying vec3 v_normal;
varying vec3 v_eyeCoords;

uniform vec4 diffuseColor;
uniform vec3 specularColor;
uniform float specularExponent;
uniform vec4 lightPosition;

void main() {
    vec3 N = normalize(v_normal);
    
    // Light direction
    vec3 L;
    if (lightPosition.w == 0.0) {
        L = normalize(lightPosition.xyz);  // Directional
    } else {
        L = normalize(lightPosition.xyz - v_eyeCoords);  // Point
    }
    
    // View direction
    vec3 V = normalize(-v_eyeCoords);
    
    // Lambert diffuse
    float NdotL = max(0.0, dot(N, L));
    vec3 diffuse = diffuseColor.rgb * NdotL;
    
    // Phong specular
    vec3 R = reflect(-L, N);
    float RdotV = max(0.0, dot(R, V));
    float spec = pow(RdotV, specularExponent);
    vec3 specular = specularColor * spec;
    
    // Ambient
    vec3 ambient = diffuseColor.rgb * 0.2;
    
    vec3 color = ambient + diffuse + specular;
    gl_FragColor = vec4(color, 1.0);
}
```

### Cell Shading (Add to fragment shader)

```glsl
void main() {
    // ... (lighting code above) ...
    
    vec3 baseColor = ambient + diffuse + specular;
    
    // Cell shading: quantize to discrete levels
    float intensity = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    
    float cellSize = 4.0;  // Number of levels
    float level = floor(intensity * cellSize) / cellSize;
    
    vec3 cellColor = baseColor * (level / max(intensity, 0.001));
    
    gl_FragColor = vec4(cellColor, 1.0);
}
```

**Alternative (simpler):**
```glsl
// Quantize each channel separately
vec3 color = ambient + diffuse + specular;
color.r = floor(color.r * cellSize) / cellSize;
color.g = floor(color.g * cellSize) / cellSize;
color.b = floor(color.b * cellSize) / cellSize;
gl_FragColor = vec4(color, 1.0);
```

---

## 9. Past Paper: Phong + Checkerboard

### Checkerboard Pattern

```glsl
void main() {
    // ... (Phong lighting) ...
    vec3 baseColor = ambient + diffuse + specular;
    
    // Checkerboard using eye coordinates
    float scale = 5.0;
    float px = mod(floor(v_eyeCoords.x * scale), 2.0);
    float pz = mod(floor(v_eyeCoords.z * scale), 2.0);
    float checker = mod(px + pz, 2.0);  // 0 or 1
    
    // Tint (don't replace!)
    float strength = 0.15;
    vec3 tint = vec3(1.0 - strength + checker * strength * 2.0);
    
    vec3 finalColor = baseColor * tint;
    gl_FragColor = vec4(finalColor, 1.0);
}
```

**Key points:**
- Use `floor()` for integer coords
- `mod(x+z, 2.0)` creates XOR pattern
- **Multiply** tint (don't add/replace)
- Use eye coords (x, z) - y is up

---

## 10. Shader Functions Reference

| Function | Use | Example |
|----------|-----|---------|
| `normalize(v)` | Unit vector | `N = normalize(v_normal)` |
| `dot(a, b)` | Dot product | `NdotL = dot(N, L)` |
| `reflect(I, N)` | Reflect vector | `R = reflect(-L, N)` |
| `max(a, b)` | Maximum | `max(0.0, NdotL)` |
| `pow(x, y)` | Power | `pow(RdotV, shininess)` |
| `floor(x)` | Round down | `floor(3.7) = 3.0` |
| `mod(x, y)` | Remainder | `mod(5.0, 2.0) = 1.0` |
| `mix(a, b, t)` | Lerp | `mix(col1, col2, 0.5)` |

---

## 11. Common Mistakes

| Mistake | Fix |
|---------|-----|
| No normals | Lighting won't work! |
| Wrong matrix for normals | Use `normalMatrix` (inverse-transpose) |
| Forgot normalize | Interpolated vectors aren't unit length |
| Replace instead of tint | Multiply, don't add/replace |
| Wrong coords for pattern | Use eye coords (not world) |
| Specular too high | Check exponent and clamp values |

---

## 12. Quick Checklist

**Old OpenGL:**
```c
✅ glEnable(GL_LIGHTING) + GL_LIGHT0
✅ Set light position & colors
✅ Set material properties
✅ Provide normals (glNormal3f)
✅ Enable GL_DEPTH_TEST
```

**WebGL Shaders:**
```glsl
✅ Pass normals from vertex → fragment
✅ Use normalMatrix for transforming normals
✅ Normalize interpolated vectors
✅ Calculate N·L for diffuse
✅ Calculate R·V for specular
✅ Always max(0, dot(...)) to clamp
```

---

## 13. Exam Strategy

**Lambert shading:** Just N·L (diffuse only)  
**Phong shading:** N·L (diffuse) + (R·V)^n (specular)  
**Cell shading:** Add `floor(intensity * levels) / levels`  
**Checkerboard:** `mod(floor(x*scale) + floor(z*scale), 2.0)`  

**Per-fragment vs Per-vertex:**
- Per-vertex: Lighting in vertex shader, pass color
- Per-fragment: Pass normal to fragment, light there (better!)

**Remember:** 
- Normalize after interpolation
- Use normalMatrix for normals
- Light direction: surface → light
- View direction: surface → camera