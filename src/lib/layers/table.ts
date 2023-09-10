import type { TableSource } from '@skeletonlabs/skeleton';
import { AppLayer } from './layer';
import type { DataTable } from '../table';

export class AppTableLayer extends AppLayer {
  public data: DataTable;

  public constructor(name: string, data: DataTable) {
    super(name);
    this.data = data;
  }
};
