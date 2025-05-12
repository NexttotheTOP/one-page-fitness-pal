import { useModelStore } from './modelStore';

export function initModelControlApi(socket: any) {
  socket.on('model:selectMuscles', (data: { muscleNames: string[] }) => {
    useModelStore.getState().selectMuscles(data.muscleNames);
  });
  socket.on('model:toggleMuscle', (data: { muscleName: string }) => {
    useModelStore.getState().toggleMuscle(data.muscleName);
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