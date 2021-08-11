import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzTreeNodeOptions, NzTreeNode, NzFormatEmitEvent, NzFormatBeforeDropEvent } from 'ng-zorro-antd/tree';
import { NzMessageService } from 'ng-zorro-antd/message';
import { IMenu } from 'src/app/domains/imenu';
import { MenuService } from 'src/app/core/services/menu.service';
import { SettingsService } from '@delon/theme';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styles: [],
})
export class MenusComponent implements OnInit {
  constructor(
    private menuService: MenuService,
    private settingService: SettingsService,
    private modal: NzModalService,
    private fb: FormBuilder,
  ) {}

  private dragMenuParent: NzTreeNode | null = null;

  nodes: NzTreeNodeOptions[] = [];
  menus: IMenu[] = [];
  menuForm!: FormGroup;

  modalTitle = '';

  menuId = 0;

  ngOnInit(): void {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required]],
      path: ['', [Validators.required]],
      iconClass: [''],
    });

    this.loadMenu();
  }

  loadMenu(): void {
    this.menuService.findAll(this.settingService.user.id).subscribe({
      next: (menus) => {
        const menuNodes: NzTreeNodeOptions[] = [];
        menus.forEach((menu) => {
          const node = this.menuNodeTransfer(menu);
          menuNodes.push(node);
        });
        this.nodes = menuNodes;
      },
    });
  }

  showAddMenuModal(title: TemplateRef<any>, content: TemplateRef<any>, footer: TemplateRef<any>, selectedNode: NzTreeNode): void {
    this.menuId = 0;
    this.modalTitle = '添加菜单';

    this.menuForm.reset();
    this.showMenuModal(title, content, footer, selectedNode);
  }

  showUpdateMenuModal(title: TemplateRef<any>, content: TemplateRef<any>, footer: TemplateRef<any>, selectedNode: NzTreeNode): void {
    this.menuId = selectedNode ? +selectedNode.key : 0;
    this.menuForm.controls.name.setValue(selectedNode.title);
    this.menuForm.controls.path.setValue(selectedNode.origin.path);
    this.menuForm.controls.iconClass.setValue(selectedNode.origin.icon);

    this.modalTitle = '修改菜单';

    this.showMenuModal(title, content, footer, selectedNode);
  }

  showMenuModal(title: TemplateRef<any>, content: TemplateRef<any>, footer: TemplateRef<any>, selectedNode: NzTreeNode) {
    this.modal.create({
      nzTitle: title,
      nzContent: content,
      nzFooter: footer,
      nzComponentParams: {
        selectedNode,
      },
    });
  }

  closeMenuModal(modalRef: NzModalRef): void {
    this.menuForm.reset();
    modalRef.destroy();
  }

  saveMenu(selectedNode: NzTreeNode, modalRef: NzModalRef): void {
    const menu: IMenu = {
      id: this.menuId,
      name: this.menuForm.controls.name.value,
      path: this.menuForm.controls.path.value,
      iconClass: this.menuForm.controls.iconClass.value,
      orderId: this.menuId ? +selectedNode.key : 0,
      parentId: this.menuId ? (selectedNode.parentNode ? +selectedNode.parentNode.key : 0) : +selectedNode.key,
    };

    // 如果是新增节点，新增节点顺序是所有兄弟节点最后
    if (this.menuId === 0) {
      if (selectedNode.children && selectedNode.children.length > 0) {
        // 选中节点包含子节点
        menu.orderId = selectedNode.children.length;
      }
    }

    // 后端保存节点
    this.menuService.save(menu).subscribe({
      next: (m) => {
        const node = this.menuNodeTransfer(m);
        // 新增节点的处理
        if (this.menuId === 0) {
          // 前端生成节点
          selectedNode.isLeaf = false;
          selectedNode.addChildren([node]);
          selectedNode.isExpanded = true;
        } else {
          // 前端更新节点
          selectedNode.title = m.name;
          selectedNode.origin.path = m.path;
          if (m.iconClass) {
            selectedNode.icon = m.iconClass;
          }
        }
        this.closeMenuModal(modalRef);
      },
    });
  }

  deleteMenu(node: NzTreeNode): void {
    // 后端删除菜单节点
    this.menuService.delete(+node.key).subscribe({
      next: () => {
        const parentNode = node.parentNode;
        // 前端删除
        node.remove();
        if (parentNode) {
          parentNode.isLeaf = !parentNode.children || parentNode?.getChildren().length === 0;
        }
      },
    });
  }

  menuOnDrop(event: NzFormatEmitEvent): void {
    if (event.eventName === 'drop') {
      const dragNode = event.dragNode as NzTreeNode; // 选中的节点
      const brotherNodes = dragNode.parentNode?.getChildren() as NzTreeNode[];
      const menus: IMenu[] = [];
      for (let i = 0; i < brotherNodes.length; i++) {
        const menu: IMenu = {
          id: +brotherNodes[i].key,
          name: brotherNodes[i].title,
          path: brotherNodes[i].origin.path,
          iconClass: brotherNodes[i].origin.icon,
          parentId: dragNode.parentNode ? +dragNode.parentNode.key : 0,
          orderId: i,
        };
        menus.push(menu);
      }

      this.menuService.batchSave(menus).subscribe({
        next: () => {},
      });
    }
  }

  beforeMenuDrop(arg: NzFormatBeforeDropEvent): Observable<boolean> {
    // console.log(arg);
    // 不允许节点移动到根节点
    const node = arg.node;
    const dragNode = arg.dragNode;

    if (!node.parentNode) {
      alert('不能移动到根节点');
      return of(false);
    } else {
      // 判断拖动后父节点是否为叶子节点
      if (node.parentNode && dragNode.parentNode) {
        if (dragNode.parentNode.getChildren().length === 1 && node.parentNode.key !== dragNode.parentNode.key) {
          dragNode.parentNode.isLeaf = true;
        }
      }
      return of(true);
    }
  }

  // IMenu到树控件数据源的转换
  private menuNodeTransfer(menu: IMenu): NzTreeNodeOptions {
    const node: NzTreeNodeOptions = {
      title: menu.name,
      key: menu.id.toString(),
      icon: menu.iconClass,
      children: [],
      isLeaf: false,
      expanded: true,
      orderId: menu.orderId,
      path: menu.path,
    };

    if (menu.children && menu.children.length > 0) {
      menu.children.forEach((child) => {
        const childNode = this.menuNodeTransfer(child);
        node.children?.push(childNode);
      });
    } else {
      node.isLeaf = true;
    }
    return node;
  }
}
