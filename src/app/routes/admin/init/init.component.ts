import { Component, OnInit } from "@angular/core"
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
    selector: 'app-init',
    templateUrl: './init.component.html'
})
export class InitComponent {

    constructor(private http: _HttpClient, private msg: NzMessageService) {}
    // 初始化菜单，admin和anonymous角色的默认菜单
    initMenu():void {
        this.http.put(environment.serverInitMenuURL).subscribe({
            next: () => this.msg.success('初始化菜单成功')
        });
    }

}