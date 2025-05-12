# 3D Muscle Model Instructions

## Adding Your 3D Model

To use the 3D muscle model viewer, place your `.glb` file in this directory (`public/models/`) with the name `muscle-model.glb`.

The app expects a model with the following characteristics:
- Realistic muscle textures (Ecorche_Muscles.png texture)
- Separate meshes for each muscle (biceps, quads, etc.)
- Shrinking muscle animation (frames 1-50)
- GLB format (ready for Three.js)

## Model Compatibility

The 3D model viewer is built with:
- Three.js - For 3D rendering
- React Three Fiber - React components for Three.js
- React Three Drei - Helper components for Three.js

If your model has different animation frames or structure, you may need to adjust the MuscleModel.tsx file accordingly.

## Troubleshooting

If your model doesn't appear:
1. Make sure it's named `muscle-model.glb` and placed in the correct directory
2. Check the browser console for errors
3. Verify that your model is in a compatible format
4. Try a smaller or optimized version if the model is too large

## Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [React Three Drei Documentation](https://github.com/pmndrs/drei) 