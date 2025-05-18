import { useModelStore } from './modelStore';

export function initModelControlApi(socket: any) {
  socket.on('model:selectMuscles', (data: { muscleNames: string[], colors?: Record<string, string> }) => {
    const muscleMap = Object.fromEntries(
      data.muscleNames.map(name => [name, data.colors?.[name] || '#FFD600'])
    );
    useModelStore.getState().setHighlightedMuscles(muscleMap);
  });
  socket.on('model:toggleMuscle', (data: { muscleName: string, color?: string }) => {
    useModelStore.getState().toggleHighlightedMuscle(data.muscleName, data.color || '#FFD600');
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
  socket.on('model:setCameraView', (data) => {
    if (data && data.position && data.target) {
      const { position, target } = data;
      console.log("Received camera view update:", position, target);
      useModelStore.getState().setCameraPosition(position);
      useModelStore.getState().setCameraTarget(target);
    }
  });
}