import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { YuleGwRoomService } from "src/app/core/services/yule/yule-gw-room.service";
import { IYuleGwRoom } from "src/app/domains/yule-resource/iyule-gw-room";

@Component({
    selector: 'app-yule-gw-room-detail',
    templateUrl: './yule-gw-room-detail.component.html',
    styles: []
  })
  export class YuleGwRoomComponent implements OnInit {

    constructor(private fb:FormBuilder, private yuleGwRoomSerivce:YuleGwRoomService){}

    resourceForm!: FormGroup;
    @Input() roomId?:number;
    @Input() resourceId?:number;

    room?: IYuleGwRoom;

    ngOnInit(): void {
      this.resourceForm = this.fb.group({
          name: ['', [Validators.required]],
          area: ['', [Validators.required, Validators.pattern('(\\d)+')]],
          hdrs: [0,[Validators.required, Validators.pattern('(\\d)+')]],
          toilet: ["false"],
          innerLock: ["false"],
          window: ["true"],
          oneThousandSongs: ["true"],
          everlight: ["true"],
      });
      if(this.roomId){
        this.initialRoom(this.roomId);
      }
    }

    // 初始化房间信息
    initialRoom(id:number){
      if(id){
        this.yuleGwRoomSerivce.findOne(id).subscribe({
          next: r => {
            this.room = r;

            this.resourceForm.controls.name.setValue(r.name);
            this.resourceForm.controls.area.setValue(r.area);
            this.resourceForm.controls.hdrs.setValue(r.hdrs);
            this.resourceForm.controls.oneThousandSongs.setValue(r.oneThousandSongs.toString());
            this.resourceForm.controls.toilet.setValue(r.toilet.toString());
            this.resourceForm.controls.innerLock.setValue(r.innerLock.toString());
            this.resourceForm.controls.window.setValue(r.window.toString());
            this.resourceForm.controls.everlight.setValue(r.everlight);

          }
        })
      }
    }

    // 计算核定人数
    getHdrs(value:number): number {
        const hdrs = Math.floor(value / 1.5);
        this.resourceForm.controls.hdrs.setValue(hdrs);
        return hdrs;
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

    // 保存包房信息
    save() {
        if (this.validate() && this.resourceId) {
            const room: IYuleGwRoom = {
              id: this.roomId,
              name: this.resourceForm.controls.name.value,
              area: this.resourceForm.controls.area.value,
              hdrs: this.resourceForm.controls.hdrs.value,
              toilet: this.resourceForm.controls.toilet.value,
              innerLock: this.resourceForm.controls.innerLock.value,
              window: this.resourceForm.controls.window.value,
              oneThousandSongs: this.resourceForm.controls.oneThousandSongs.value,
              everlight: this.resourceForm.controls.everlight.value,
              yuleResourceBaseId: this.resourceId,
            };
          
            this.yuleGwRoomSerivce.save(room).subscribe({
              next: r => {
                this.roomId = r.id;
                // this.dataChanged.emit();
              }
            });
            
          }
    }

  }