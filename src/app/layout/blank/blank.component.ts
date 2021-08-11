import { Component } from '@angular/core';

@Component({
  selector: 'layout-blank',
  template: `<router-outlet></router-outlet> `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.alain-blank]': 'true'
  }
})
export class LayoutBlankComponent {}
