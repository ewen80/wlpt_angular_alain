import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'header-clear-storage',
  template: `
    <i nz-icon nzType="tool"></i>
    清理本地缓存
  `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.d-block]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderClearStorageComponent {
  constructor(private modalSrv: NzModalService, private messageSrv: NzMessageService) {}

  @HostListener('click')
  _click(): void {
    this.modalSrv.confirm({
      nzTitle: 'Make sure clear all local storage?',
      nzOnOk: () => {
        localStorage.clear();
        this.messageSrv.success('Clear Finished!');
      }
    });
  }
}
