import { useModelStore } from './modelStore';

export function initModelControlApi(socket: any) {
  socket.on('model_event', (data: { type: string, payload: any }) => {
    switch (data.type) {
      case 'model:selectMuscles': {
        const muscleMap = Object.fromEntries(
          data.payload.muscleNames.map((name: string) => [name, data.payload.colors?.[name] || '#FFD600'])
        );
        useModelStore.getState().setHighlightedMuscles(muscleMap);
        break;
      }
      case 'model:toggleMuscle': {
        useModelStore.getState().toggleHighlightedMuscle(
          data.payload.muscleName,
          data.payload.color
        );
        break;
      }
      case 'model:setCameraView': {
        if (data.payload && data.payload.position && data.payload.target) {
          useModelStore.getState().setCameraPosition(data.payload.position);
          useModelStore.getState().setCameraTarget(data.payload.target);
        }
        break;
      }
      case 'model:resetCamera': {
        useModelStore.getState().resetCamera();
        break;
      }
      // ...handle other types as needed
      case 'model:setAnimationFrame': {
        useModelStore.getState().setAnimationFrame(data.payload.frame);
        break;
      }
      case 'model:toggleAnimation': {
        useModelStore.getState().toggleAnimation(data.payload.isPlaying);
        break;
      }
    }
  });

  // Direct listeners for backward compatibility
  socket.on('model:toggleMuscle', (data: { muscleName: string, color?: string }) => {
    useModelStore.getState().toggleHighlightedMuscle(data.muscleName, data.color);
  });
  socket.on('model:setAnimationFrame', (data: { frame: number }) => {
    useModelStore.getState().setAnimationFrame(data.frame);
  });
  socket.on('model:toggleAnimation', (data: { isPlaying: boolean }) => {
    useModelStore.getState().toggleAnimation(data.isPlaying);
  });
  socket.on('model:setCameraPosition', (data: { position: { x: number; y: number; z: number } }) => {
    useModelStore.getState().setCameraPosition(data.position);
  });
  socket.on('model:resetCamera', () => {
    useModelStore.getState().resetCamera();
  });
  socket.on('model:setCameraTarget', (data: { target: { x: number; y: number; z: number } }) => {
    useModelStore.getState().setCameraTarget(data.target);
  });
}