# Hierarchical Modelling 

> **Complete guide for Section 6 + Lab 2 coding**  
> Includes: Subroutines, Scene Graphs, Transformations, Save/Restore, Animation  
> Tips: Use subroutines for simple hierarchies; scene graphs for reuse/complexity. Always save/restore to isolate transforms. Test incrementally.

---

## 1. Introduction to Hierarchical Modelling

**Break complex objects into simpler parts in a tree structure.**  
- **Benefits**: Reuse, easy animation, modular code.  
- **Coding Tip**: Start from leaf nodes (basic shapes) and build up to root (full scene).  
- **Example Scene**: Windmill (base + rotating blades), Cart (body + wheels).  
- **Common Mistake**: Forgetting to isolate transforms – leads to unwanted propagation (e.g., rotating blades rotate the ground).

---

## 2. Subroutine Hierarchy (Section 6.2)

**Build with functions – each draws a part, calls sub-parts.**

### 2.1 Basic Subroutine Example

```js
function drawRectangle(g, x, y, width, height, color) {
    g.fillStyle = color;
    g.fillRect(x, y, width, height);
}
```

> Tip: Parameters for flexibility (position, size, color).  
> Technique: Define basics first (rect, circle, triangle).

---

### 2.2 Creating Hierarchical Structure

Parent calls children.

```js
function drawHouseBase(g, x, y, width, height) {
    drawRectangle(g, x, y, width, height, 'brown');  // Walls
    drawRectangle(g, x + width/3, y + height/2, width/3, height/2, 'black');  // Door
}

function drawRoof(g, x, y, width, height) {
    g.fillStyle = 'red';
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + width / 2, y - height);
    g.lineTo(x + width, y);
    g.closePath();
    g.fill();
}

function drawHouse(g, x, y, width, height) {
    drawHouseBase(g, x, y, width, height * 0.75);
    drawRoof(g, x, y, width, height * 0.25);
}
```

> Tip: Use relative coords (0,0 center) for easy transforms.  
> Technique: Test each function alone in draw().

---

### 2.3 Applying Transformations

Modify coordinate system for positioning.

```js
function drawHouse(g, x, y, width, height, angle) {
    g.save();
    g.translate(x, y);       // Position
    g.rotate(angle);         // Orientation
    g.scale(width/100, height/100);  // Assume base size 100
    drawHouseBase(g, -50, -50, 100, 75);  // Centered at 0,0
    drawRoof(g, -50, -50, 100, 25);
    g.restore();
}
```

> Order: Scale → Rotate → Translate (fixed in Canvas).  
> Tip: Use `g.transform(1, shearY, shearX, 1, 0, 0)` for skew.

---

### 2.4 Save and Restore (Importance & How-To)

Isolate transforms to prevent leakage.

**Importance:** Without it, child transforms affect siblings/parents (e.g., wheel rotation rotates cart body).  
**How-To:** `save()` before transforms, `restore()` after drawing sub-object.  
**Stack Behavior:** Push (save) / Pop (restore) – match every save with restore.

**Example (Nested):**

```js
function drawWindmill(g) {
    g.save();                // Save for base
    g.translate(0, 2);       // Position base
    drawBase(g);
    g.restore();

    g.save();                // Save for blades
    g.translate(0, 2);       // Position top
    g.rotate(frameNumber * 0.1);  // Animate blades
    drawBlades(g);
    g.restore();
}
```

> Tip: If bugs, log transform state or draw debug axes.  
> Technique: For animation, update inside subroutine (e.g., rotate based on frameNumber).

---

## 3. Scene Graphs (Section 6.3)

Object-oriented data structure – nodes for objects/transforms.

### 3.1 SceneGraphNode (Base)

Abstract – override `doDraw(g)` for custom drawing.

**Example (Line):**

```js
let line = new SceneGraphNode();
line.doDraw = function(g) {
    g.beginPath();
    g.moveTo(-0.5, 0);
    g.lineTo(0.5, 0);
    g.stroke();
};
```

---

### 3.2 CompoundObject (Group Sub-Objects)

```js
function CompoundObject() {
    SceneGraphNode.call(this);
    this.subobjects = [];
}
CompoundObject.prototype.add = function(node) {
    this.subobjects.push(node);
    return this;  // Chainable
};
CompoundObject.prototype.doDraw = function(g) {
    this.subobjects.forEach(sub => sub.draw(g));
};
```

> Tip: Use for groups (e.g., wheel = circle + spokes).

---

### 3.3 TransformedObject (Apply Transforms)

```js
function TransformedObject(object) {
    SceneGraphNode.call(this);
    this.object = object;
    this.rotationInDegrees = 0;
    this.scaleX = 1; this.scaleY = 1;
    this.translateX = 0; this.translateY = 0;
}
TransformedObject.prototype.setRotation = function(deg) {
    this.rotationInDegrees = deg;
    return this;
};
TransformedObject.prototype.setScale = function(sx, sy) {
    this.scaleX = sx; this.scaleY = sy;
    return this;
};
TransformedObject.prototype.setTranslation = function(dx, dy) {
    this.translateX = dx; this.translateY = dy;
    return this;
};
TransformedObject.prototype.doDraw = function(g) {
    g.save();
    g.translate(this.translateX, this.translateY);
    g.rotate(this.rotationInDegrees * Math.PI / 180);
    g.scale(this.scaleX, this.scaleY);
    this.object.draw(g);
    g.restore();
};
```

Chain example:  
`.setScale(2,2).setRotation(45).setTranslation(100,100)`

> Tip: Transforms auto-isolated with save/restore.

---

### 3.4 Building a Scene (Car Example)

```js
let world = new CompoundObject();

// Wheel
let wheelTemp = new CompoundObject();
wheelTemp.add( new TransformedObject(filledCircle).setScale(2,2) );
for (let i = 0; i < 12; i++) {
    wheelTemp.add( new TransformedObject(line).setRotation(i*30) );
}
let wheel = new TransformedObject(wheelTemp);

// Cart
let cartTemp = new CompoundObject();
cartTemp.add( new TransformedObject(wheel).setScale(0.8,0.8).setTranslation(-1.65,-0.1) );
cartTemp.add( new TransformedObject(wheel).setScale(0.8,0.8).setTranslation(1.65,-0.1) );
cartTemp.add( new TransformedObject(filledRect).setScale(6,1.5).setTranslation(0,1) );
let cart = new TransformedObject(cartTemp).setScale(0.3,0.3);

world.add(cart);
```

> How to Make Your Own: Define templates (CompoundObject), wrap in TransformedObject for positioning. Add to root.

---

### 3.5 Traversal & Stack

Push/Pop: Auto in `doDraw()` (save/restore).  
Importance: Ensures child transforms don't affect siblings.  
> Tip: For complex, visualize tree – draw on paper first.

---

## 4. Animation (Section 6.4)

Update in `updateFrame()` – redraw full scene.

**Basic Update**

```js
function updateFrame() {
    frameNumber++;
    cart.setTranslation(Math.sin(frameNumber * 0.05) * 2, 0);  // Oscillate
    wheel.setRotation(frameNumber * 3);  // Spin
}
```

> Tips: Use `%` for loops, `Math.sin/cos` for smooth motion.  
> Techniques: Procedural (physics-like), keyframe interpolation (lerp between poses).  
> Advanced: Inverse Kinematics (IK) for limbs – calculate joint angles from end position.

**Example: Ferris Wheel (Ex 3 Idea)**

```js
let wheel = new TransformedObject(wheelTemp).setRotation(frameNumber * 0.05);  // Spin wheel
for (let i = 0; i < 8; i++) {
    let seat = new TransformedObject(seatTemp)
        .setTranslation(0, r)
        .setRotation(-frameNumber * 0.05)  // Counter-rotate seat to stay horizontal
        .setRotation(i * 45);  // Position on wheel
    wheel.add(seat);
}
```

> Make Your Own: Think real-world (sailboat rocking, airplane flying). Add multiple instances (e.g., 2 carts).

---

## 5. Exam Tips & Techniques

- **Subroutine vs Scene Graph:** Subroutines for quick/simple; Graphs for reuse/animation (easier updates).  
- **Save/Restore Importance:** Prevents "bleed" – always bracket transforms.  
- **How to Code Your Own:**
  1. Sketch hierarchy tree.
  2. Define basics (leaf nodes).
  3. Build composites (parents call children).
  4. Add transforms/animation last.
  5. Test: Comment out parts, draw one level at a time.

> **Common Errors:** Mismatched save/restore, wrong order (translate last), forgetting relative coords.  
> **Lab 2 Style Questions:** Build cart/windmill, animate rotation/translation, create custom scene (ferris wheel, swing).

---

## 6. Lab 2 Complete Solutions Explained

### Lab 2 Overview

**Goal:** Create an animated scene with three triangle assemblies (different sizes/positions). Each assembly has:
- A filled triangle (base)
- A red bar on top (rotating)
- Two circles with slices on the bar ends (counter-rotating)

**Requirements:**
- Exercise 1: Use subroutines
- Exercise 2: Use scene graphs (same visual result)

---

### Exercise 1: Subroutine Hierarchy Solution

#### Step 1: Understand the Hierarchy

```
Scene
├── Triangle Assembly 1 (center, blue, scale 1.25)
│   ├── Filled Triangle
│   ├── Rotating Bar
│   └── Two Counter-Rotating Circle Slices
├── Triangle Assembly 2 (left, purple, scale 1.0)
│   └── (same structure)
└── Triangle Assembly 3 (right, green, scale 0.75)
    └── (same structure)
```

#### Step 2: Build from Bottom Up

**A. Basic Shape: Circle with Slices**

```js
function circleSlices(x, y, radius, slices) {
    for (let i = 0; i < slices; i++) {
        const startAngle = (i * 2 * Math.PI) / slices;
        const endAngle = ((i + 1) * 2 * Math.PI) / slices;
        
        graphics.beginPath();
        graphics.moveTo(x, y);
        graphics.arc(x, y, radius, startAngle, endAngle);
        graphics.closePath();
        graphics.strokeStyle = "black";
        graphics.stroke();
    }
}
```

**Why 12 slices?** Creates a clock-like appearance. Adjust for different looks.

**B. Draw Filled Triangle**

```js
function filledTriangle(g2, x, y, color = "blue", scale = 1) {
    const halfWidth = 0.25 * scale;
    const height = 1.5 * scale;
    
    g2.beginPath();
    g2.moveTo(x - halfWidth, y);   // left base
    g2.lineTo(x + halfWidth, y);   // right base
    g2.lineTo(x, y + height);      // tip upward
    g2.closePath();
    g2.fillStyle = color;
    g2.fill();
}
```

**Key Insight:** Parameters allow different colors/scales for three assemblies.

**C. Bar with Rotation**

```js
function barOnTip(x, y, angle, scale = 1) {
    graphics.save();
    graphics.translate(x, y);      // Move to bar position
    graphics.rotate(angle);        // Rotate bar
    filledRect(0, 0, 2.5 * scale, 0.2 * scale);  // Draw centered bar
    graphics.restore();
}
```

**Critical:** `save/restore` prevents bar rotation from affecting triangles.

**D. Circles on Bar Ends (Counter-Rotating)**

```js
function rotatingCirclesOnBar(x, y, angle, scale = 1) {
    graphics.save();
    graphics.translate(x, y);
    graphics.rotate(angle);        // Same rotation as bar
    
    const offset = 1.25 * scale;   // Distance from bar center to ends
    const circleRadius = 0.5 * scale;
    const slices = 12;
    
    // Left circle (clockwise rotation)
    graphics.save();
    graphics.translate(-offset, 0);
    graphics.rotate(frameNumber * 0.1);   // Independent rotation
    circleSlices(0, 0, circleRadius, slices);
    graphics.restore();
    
    // Right circle (counter-clockwise)
    graphics.save();
    graphics.translate(offset, 0);
    graphics.rotate(-frameNumber * 0.1);  // Opposite direction
    circleSlices(0, 0, circleRadius, slices);
    graphics.restore();
    
    graphics.restore();
}
```

**Why nested save/restore?**
- Outer: Isolates bar+circles system
- Inner: Isolates each circle's rotation

#### Step 3: Assemble in drawWorld()

```js
function drawWorld() {
    const angle = frameNumber * 0.025;  // Shared rotation speed
    
    // Center blue triangle (scale 1.25)
    const triX = 0, triY = -2.9, triScale = 1.25;
    filledTriangle(graphics, triX, triY, "blue", triScale);
    barOnTip(triX, triY + 1.5 * triScale, angle, triScale);
    rotatingCirclesOnBar(triX, triY + 1.5 * triScale, angle, triScale);
    
    // Left purple triangle (scale 1.0)
    const leftX = -2.5, leftY = 0.0, leftScale = 1;
    filledTriangle(graphics, leftX, leftY, "purple", leftScale);
    barOnTip(leftX, leftY + 1.5 * leftScale, angle, leftScale);
    rotatingCirclesOnBar(leftX, leftY + 1.5 * leftScale, angle, leftScale);
    
    // Right green triangle (scale 0.75)
    const rightX = 2.75, rightY = 0.5, rightScale = 0.75;
    filledTriangle(graphics, rightX, rightY, "green", rightScale);
    barOnTip(rightX, rightY + 1.5 * rightScale, angle, rightScale);
    rotatingCirclesOnBar(rightX, rightY + 1.5 * rightScale, angle, rightScale);
}
```

**Why `triY + 1.5 * triScale`?** Bar sits on triangle tip (triangle height = 1.5 * scale).

#### Step 4: Animation in updateFrame()

```js
function updateFrame() {
    frameNumber++;
    // Animation handled in drawWorld via frameNumber
}
```

**Subroutine Approach:** Animation logic embedded in drawing functions (bar angle, circle rotations).

---

### Exercise 2: Scene Graph Solution

#### Key Differences from Subroutines

1. **Separation of concerns:** Structure built once in `createWorld()`, animation in `updateFrame()`
2. **Object references:** Store objects to modify later
3. **Declarative:** Describe *what* objects are, not *how* to draw them

#### Step 1: Define Custom Shapes

**Circle Slices as SceneGraphNode:**

```js
var circleSlices = new SceneGraphNode();
circleSlices.slices = 12;
circleSlices.doDraw = function(g) {
    for (let i = 0; i < this.slices; i++) {
        const startAngle = (i * 2 * Math.PI) / this.slices;
        const endAngle = ((i + 1) * 2 * Math.PI) / this.slices;
        g.beginPath();
        g.moveTo(0, 0);
        g.arc(0, 0, 0.5, startAngle, endAngle);  // Radius 0.5 (standard)
        g.closePath();
        g.strokeStyle = "black";
        g.stroke();
    }
}
```

**Why override `doDraw`?** SceneGraphNode is abstract – must define drawing behavior.

**Filled Triangle (Already Defined in API):**

```js
var filledTriangle = new SceneGraphNode();
filledTriangle.doDraw = function(g) {
    g.beginPath();
    g.moveTo(-0.5, 0);   // left base
    g.lineTo(0.5, 0);    // right base
    g.lineTo(0, 1);      // tip
    g.closePath();
    g.fill();
}
```

#### Step 2: Build One Triangle Assembly

**Structure:**
```
CompoundObject (triangle assembly)
├── TransformedObject(filledTriangle) [scaled, colored, positioned]
└── TransformedObject(barAssembly) [translated to tip, rotates]
    ├── TransformedObject(filledRect) [bar, scaled, colored]
    ├── TransformedObject(circleSlices) [left, translated, scaled, rotates]
    └── TransformedObject(circleSlices) [right, translated, scaled, rotates]
```

**Code for Center (Blue) Triangle:**

```js
// Root compound
const centerTriangle = new CompoundObject();

// Triangle base
const centerTri = new TransformedObject(filledTriangle);
centerTri.setTranslation(0, -2.9)
         .setScale(0.5 * 1.25, 1.5 * 1.25)  // Width=0.5, Height=1.5
         .setColor("blue");
centerTriangle.add(centerTri);

// Bar assembly (compound)
const centerBarAssembly = new CompoundObject();

// Red bar
const centerBar = new TransformedObject(filledRect);
centerBar.setScale(2.5 * 1.25, 0.2 * 1.25)
         .setColor("red");
centerBarAssembly.add(centerBar);

// Left circle
const centerLeftCircle = new TransformedObject(circleSlices);
centerLeftCircle.setTranslation(-1.25 * 1.25, 0)
                .setScale(0.5 * 1.25, 0.5 * 1.25);
centerBarAssembly.add(centerLeftCircle);

// Right circle
const centerRightCircle = new TransformedObject(circleSlices);
centerRightCircle.setTranslation(1.25 * 1.25, 0)
                 .setScale(0.5 * 1.25, 0.5 * 1.25);
centerBarAssembly.add(centerRightCircle);

// Wrap bar assembly in TransformedObject for rotation
const centerBarTransform = new TransformedObject(centerBarAssembly);
centerBarTransform.setTranslation(0, -2.9 + 1.5 * 1.25);  // On tip
centerTriangle.add(centerBarTransform);
```

**Critical Insight:** Bar assembly is a `CompoundObject` wrapped in `TransformedObject` so we can rotate it as a unit.

#### Step 3: Store References for Animation

```js
var triangles = [];  // Array of objects to animate

triangles.push({
    barTransform: centerBarTransform,
    leftCircle: centerLeftCircle,
    rightCircle: centerRightCircle
});

world.add(centerTriangle);
```

**Why store references?** We need to update rotations in `updateFrame()`.

#### Step 4: Repeat for Other Two Triangles

**Left (Purple, Scale 1.0) and Right (Green, Scale 0.75):**

Same structure, different parameters:
- Position: `(-2.5, 0.0)` and `(2.75, 0.5)`
- Colors: `"purple"` and `"green"`
- Scales: `1.0` and `0.75`

```js
// Left triangle (abbreviated)
const leftTri = new TransformedObject(filledTriangle);
leftTri.setTranslation(-2.5, 0.0)
       .setScale(0.5 * 1, 1.5 * 1)
       .setColor("purple");
// ... (same bar/circle structure)

// Right triangle (abbreviated)
const rightTri = new TransformedObject(filledTriangle);
rightTri.setTranslation(2.75, 0.5)
        .setScale(0.5 * 0.75, 1.5 * 0.75)
        .setColor("green");
// ... (same bar/circle structure)
```

#### Step 5: Animation in updateFrame()

```js
function updateFrame() {
    frameNumber++;
    const angle = frameNumber * 0.025 * 180 / Math.PI;  // Convert to degrees
    
    // Update all three assemblies
    for (let i = 0; i < triangles.length; i++) {
        triangles[i].barTransform.setRotation(angle);  // Bar rotation
        triangles[i].leftCircle.setRotation(frameNumber * 0.1 * 180 / Math.PI);   // Clockwise
        triangles[i].rightCircle.setRotation(-frameNumber * 0.1 * 180 / Math.PI); // Counter-clockwise
    }
}
```

**Why degrees?** `TransformedObject` expects degrees, converts internally to radians.

---

### Comparison: Subroutines vs Scene Graphs

| Aspect | Subroutines (Ex1) | Scene Graphs (Ex2) |
|--------|-------------------|-------------------|
| **Structure** | Functions calling functions | Objects containing objects |
| **Animation** | Embedded in drawing code | Separate in `updateFrame()` |
| **Reusability** | Call function multiple times | Clone/reuse object references |
| **Complexity** | Simpler for quick tasks | Better for complex hierarchies |
| **State** | Implicit (via parameters) | Explicit (object properties) |
| **Modification** | Re-call functions | Update object properties |

---

### Common Mistakes & Debugging

#### 1. **Mismatched Save/Restore**

**Error:** Transforms leak to other objects.

```js
// WRONG
graphics.save();
graphics.rotate(angle);
// Missing restore!

// RIGHT
graphics.save();
graphics.rotate(angle);
drawObject();
graphics.restore();
```

**Fix:** Count saves and restores – must be equal.

#### 2. **Wrong Transform Order**

**Error:** Objects positioned incorrectly.

```js
// WRONG: Scale affects translation
graphics.translate(x, y);
graphics.scale(2, 2);

// RIGHT: Scale first (Canvas order fixed)
graphics.scale(2, 2);
graphics.translate(x, y);
```

**Rule:** Canvas applies: Translate → Rotate → Scale. Plan accordingly.

#### 3. **Forgetting to Scale Child Parameters**

**Error:** Bar/circles don't scale with triangle.

```js
// WRONG
barOnTip(triX, triY + 1.5, angle, triScale);  // Height not scaled!

// RIGHT
barOnTip(triX, triY + 1.5 * triScale, angle, triScale);
```

**Fix:** Multiply all positions/sizes by scale factor.

#### 4. **Scene Graph: Not Storing References**

**Error:** Can't animate objects.

```js
// WRONG
world.add(new TransformedObject(barAssembly).setTranslation(0, 2));

// RIGHT
const barTransform = new TransformedObject(barAssembly);
barTransform.setTranslation(0, 2);
world.add(barTransform);
triangles.push({ barTransform });  // Store for later
```

**Fix:** Assign to variables before adding to scene.

#### 5. **Radians vs Degrees**

**Error:** Rotations look wrong.

```js
// Canvas uses radians
graphics.rotate(45);  // WRONG: 45 radians!
graphics.rotate(45 * Math.PI / 180);  // RIGHT: 45 degrees

// Scene graph uses degrees
barTransform.setRotation(45);  // RIGHT
```

**Fix:** Know which unit each API expects.

---

### Testing Strategy

#### Incremental Testing

1. **Draw one triangle** (no bar/circles)
2. **Add static bar** (no rotation)
3. **Add rotating bar** (frameNumber * 0.025)
4. **Add one circle** (static)
5. **Add rotating circle** (frameNumber * 0.1)
6. **Add second circle** (opposite rotation)
7. **Clone for other two triangles**

**Comment out code** to isolate issues:

```js
// Test triangle only
filledTriangle(graphics, 0, 0, "blue", 1.25);
// barOnTip(...);  // Commented out
// rotatingCirclesOnBar(...);  // Commented out
```

#### Debug Helpers

**Draw coordinate axes:**

```js
function drawAxes() {
    graphics.strokeStyle = "red";
    graphics.beginPath();
    graphics.moveTo(-5, 0);
    graphics.lineTo(5, 0);
    graphics.stroke();
    
    graphics.strokeStyle = "blue";
    graphics.beginPath();
    graphics.moveTo(0, -5);
    graphics.lineTo(0, 5);
    graphics.stroke();
}
```

**Log transforms:**

```js
console.log("Bar angle:", angle);
console.log("Circle rotation:", frameNumber * 0.1);
```

---

### Lab 2 Success Checklist

- [ ] Three triangle assemblies visible
- [ ] Triangles have different colors (blue, purple, green)
- [ ] Triangles have different sizes (1.25, 1.0, 0.75)
- [ ] Triangles positioned correctly (center, left, right)
- [ ] Red bars rotate smoothly
- [ ] All three bars rotate at same speed
- [ ] Circles have 12 slices each
- [ ] Left circles rotate clockwise
- [ ] Right circles rotate counter-clockwise
- [ ] Circles rotate faster than bars (4x speed: 0.1 vs 0.025)
- [ ] Animation runs when checkbox clicked
- [ ] No transforms leak between objects
- [ ] Code uses good style (comments, indentation)
- [ ] File named correctly (Lab2Ex1.html / Lab2Ex2.html)

---

### Advanced Techniques for Custom Scenes

#### 1. Oscillating Motion

```js
// Sine wave horizontal movement
const x = Math.sin(frameNumber * 0.05) * 2;
cart.setTranslation(x, 0);

// Cosine wave vertical bounce
const y = Math.cos(frameNumber * 0.1) * 0.5;
ball.setTranslation(0, y);
```

#### 2. Dependent Rotations

```js
// Wheel rotation depends on cart position
const distance = frameNumber * 0.05;
const wheelAngle = distance * 50;  // Rotate based on distance
wheel.setRotation(wheelAngle);
```

#### 3. Hierarchical Animation (Ferris Wheel)

```js
// Wheel rotates
const wheelAngle = frameNumber * 0.05;
ferrisWheel.setRotation(wheelAngle);

// Seats counter-rotate to stay horizontal
for (let seat of seats) {
    seat.setRotation(-wheelAngle);  // Opposite rotation
}
```

#### 4. Pulsing Scale

```js
const scale = 1 + Math.sin(frameNumber * 0.1) * 0.2;  // 0.8 to 1.2
heart.setScale(scale, scale);
```

---

### Final Tips for Exam

1. **Draw hierarchy tree** on paper before coding
2. **Test each level** independently (bottom-up)
3. **Match save/restore** pairs religiously
4. **Use descriptive names** (wheelLeft, barRotation, not obj1, obj2)
5. **Comment complex transforms** ("Position bar on triangle tip")
6. **Check scale propagation** (parent scale affects children)
7. **Animation in updateFrame()** (scene graphs) or embedded (subroutines)
8. **Degrees vs radians** – know your API!

**Practice prompt:** "Create a windmill with rotating blades, each blade made of 3 triangles."

Good luck! 🚀