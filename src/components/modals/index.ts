import type { ModalComponent } from '@skeletonlabs/skeleton';
import NewBasemapLayerModal from './NewBasemapLayerModal.svelte';
import NewObjectLayerModal from './NewObjectLayerModal.svelte';

export const modalNewBasemapLayer: ModalComponent = {
  ref: NewBasemapLayerModal
};

export const modalNewObjectLayer: ModalComponent = {
  ref: NewObjectLayerModal
};
