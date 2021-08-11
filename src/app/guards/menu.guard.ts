import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanActivateChild,
  CanLoad,
  Route,
  UrlSegment
} from '@angular/router';
import { MenuService } from '@delon/theme';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuGuard implements CanActivateChild {
  constructor(private menuService: MenuService) {}
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // 根据当前地址，寻找对应菜单，如果能找到表示有权限
    const menus = this.menuService.getPathByUrl(state.url);
    return menus.filter(m => m.link === state.url).length === 0 ? false : true;
  }
}
