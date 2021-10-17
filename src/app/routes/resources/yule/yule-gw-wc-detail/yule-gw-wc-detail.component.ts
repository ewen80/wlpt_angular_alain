import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { YuleGwWcService } from "src/app/core/services/yule/yule-gw-wc.service";
import { IYuleGwRoom } from "src/app/domains/yule-resource/iyule-gw-room";
import { IYuleGwWc } from "src/app/domains/yule-resource/iyule-gw-wc";

@Component({
    selector: 'app-yule-gw-wc-detail',
    templateUrl: './yule-gw-wc-detail.component.html',
    styles: []
  })
  export class YuleGwWcComponent implements OnInit {

    constructor(private fb:FormBuilder, private yuleGwWcSerivce:YuleGwWcService){}

    resourceForm!: FormGroup;
    @Input() wcId?:number;
    @Input() resourceId?:number;

    wc?: IYuleGwWc;

    ngOnInit(): void {
      this.resourceForm = this.fb.group({
          name: ['', [Validators.required]],
          area: ['', [Validators.required, Validators.pattern('(\\d)+')]],
          dlwc: ["false"],
          ywjf: ["false"],
      });
      if(this.wcId){
        this.initialWc(this.wcId);
      }
    }

    // 初始化舞池信息
    initialWc(id:number){
      if(id){
        this.yuleGwWcSerivce.findOne(id).subscribe({
          next: r => {
            this.wc = r;

            this.resourceForm.controls.name.setValue(r.name);
            this.resourceForm.controls.area.setValue(r.area);
            this.resourceForm.controls.dlwc.setValue(r.dlwc.toString());
            this.resourceForm.controls.ywjf.setValue(r.ywjf.toString());
          }
        })
      }
    }

    // 验证表单
    validate(): boolean {
        // eslint-disable-next-line guard-for-in
        for (const i in this.resourceForm.controls) {
            this.resourceForm.controls[i].markAsDirty();
            this.resourceForm.controls[i].updateValueAndValidity();
        }
        return this.resourceForm.valid;
    }

    // 保存信息
    save() {
        if (this.validate() && this.resourceId) {
            const wc: IYuleGwWc = {
              id: this.wcId,
              name: this.resourceForm.controls.name.value,
              area: this.resourceForm.controls.area.value,
              dlwc: this.resourceForm.controls.dlwc.value,
              ywjf: this.resourceForm.controls.ywjf.value,
              yuleResourceBaseId: this.resourceId,
            };
          
            this.yuleGwWcSerivce.save(wc).subscribe({
              next: r => {
                this.wcId = r.id;
                // this.dataChanged.emit();
              }
            });
            
          }
    }

  }